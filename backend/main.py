from datetime import datetime

import httpx
import time
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from database import create_db_and_tables, get_session
from models import (
    Monitor,
    CheckResult,
    Incident,
    UserCreate,
    UserResponse,
    UserLogin,
    TokenResponse,
    User
)
from sqlmodel import Session, select
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MonitorCreate(BaseModel):
    name: str
    url: str
    check_interval: int
    expected_status: int


scheduler = BackgroundScheduler()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

    session = next(get_session())

    try:
        monitors = session.exec(select(Monitor)).all()

        for monitor in monitors:
            scheduler.add_job(
                check_monitor,
                "interval",
                seconds=monitor.check_interval,
                args=[monitor.id],
                id=f"monitor_{monitor.id}",
                replace_existing=True,
                max_instances=1
            )

        scheduler.start()

    finally:
        session.close()


@app.post("/monitors")
def create_monitor(
    monitor: MonitorCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_monitor = Monitor(
        name=monitor.name,
        url=monitor.url,
        check_interval=monitor.check_interval,
        expected_status=monitor.expected_status,
        user_id=current_user.id
    )

    session.add(db_monitor)
    session.commit()
    session.refresh(db_monitor)

    scheduler.add_job(
        check_monitor,
        "interval",
        seconds=db_monitor.check_interval,
        args=[db_monitor.id],
        id=f"monitor_{db_monitor.id}",
        replace_existing=True,
        max_instances=1
    )

    return db_monitor


@app.get("/monitors")
def read_monitors(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return session.exec(
        select(Monitor).where(
            Monitor.user_id == current_user.id
        )
    ).all()


@app.get("/monitors/{monitor_id}")
def read_monitor(
    monitor_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    monitor = session.exec(
        select(Monitor).where(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id
        )
    ).first()

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found"
        )

    return monitor


@app.patch("/monitors/{monitor_id}")
def update_monitor(
    monitor_id: int,
    monitor_update: MonitorCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    monitor = session.exec(
        select(Monitor).where(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id
        )
    ).first()

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found"
        )

    monitor.name = monitor_update.name
    monitor.url = monitor_update.url
    monitor.check_interval = monitor_update.check_interval
    monitor.expected_status = monitor_update.expected_status

    session.add(monitor)
    session.commit()
    session.refresh(monitor)

    scheduler.reschedule_job(
        f"monitor_{monitor.id}",
        trigger="interval",
        seconds=monitor.check_interval
    )

    return monitor


@app.post("/monitors/{monitor_id}/check_results")
def create_check_result(
    monitor_id: int,
    check_result: CheckResult,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    monitor = session.exec(
        select(Monitor).where(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id
        )
    ).first()

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found"
        )

    db_check_result = CheckResult(
        monitor_id=monitor_id,
        status_code=check_result.status_code,
        response_time=check_result.response_time,
        is_up=check_result.is_up,
        error_message=check_result.error_message
    )

    session.add(db_check_result)
    session.commit()
    session.refresh(db_check_result)

    return db_check_result


@app.get("/monitors/{monitor_id}/check_results")
def read_check_results(
    monitor_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    monitor = session.exec(
        select(Monitor).where(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id
        )
    ).first()

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found"
        )

    return session.exec(
        select(CheckResult)
        .where(CheckResult.monitor_id == monitor_id)
    ).all()


@app.get("/check_results")
def read_all_check_results(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    monitor_ids = session.exec(
        select(Monitor.id).where(
            Monitor.user_id == current_user.id
        )
    ).all()

    if not monitor_ids:
        return []

    return session.exec(
        select(CheckResult)
        .where(CheckResult.monitor_id.in_(monitor_ids))
    ).all()


def check_monitor(monitor_id: int):
    session = next(get_session())

    try:
        monitor = session.get(Monitor, monitor_id)
    finally:
        session.close()

    if not monitor:
        print(f"Monitor {monitor_id} not found")
        return

    print(f"Checking monitor: {monitor.name}")

    start_time = time.perf_counter()

    try:
        response = httpx.get(
            monitor.url,
            timeout=10
        )

        end_time = time.perf_counter()
        response_time = (end_time - start_time) * 1000

        is_up = response.status_code == monitor.expected_status

        session = next(get_session())

        try:
            check_result = CheckResult(
                monitor_id=monitor.id,
                status_code=response.status_code,
                response_time=response_time,
                is_up=is_up,
                error_message=None
            )

            session.add(check_result)

            open_incident = session.exec(
                select(Incident)
                .where(
                    Incident.monitor_id == monitor.id,
                    Incident.status == "open"
                )
            ).first()

            if not is_up:
                if not open_incident:
                    incident = Incident(
                        monitor_id=monitor.id,
                        started_at=datetime.utcnow(),
                        status="open",
                        reason=(
                            f"Expected status "
                            f"{monitor.expected_status}, "
                            f"got {response.status_code}"
                        )
                    )

                    session.add(incident)

                    print(
                        f"INCIDENT CREATED: "
                        f"{monitor.name}"
                    )

                else:
                    print(
                        f"INCIDENT STILL OPEN: "
                        f"{monitor.name}"
                    )

            else:
                if open_incident:
                    open_incident.status = "resolved"
                    open_incident.resolved_at = datetime.utcnow()

                    session.add(open_incident)

                    print(
                        f"INCIDENT RESOLVED: "
                        f"{monitor.name}"
                    )

            session.commit()

        except Exception:
            session.rollback()
            raise

        finally:
            session.close()

        print(
            f"{monitor.name}: "
            f"{'UP' if is_up else 'DOWN'} "
            f"{response.status_code} "
            f"{response_time:.2f} ms"
        )

    except httpx.RequestError as e:
        end_time = time.perf_counter()
        response_time = (end_time - start_time) * 1000

        session = next(get_session())

        try:
            check_result = CheckResult(
                monitor_id=monitor.id,
                status_code=None,
                response_time=response_time,
                is_up=False,
                error_message=str(e)
            )

            session.add(check_result)

            open_incident = session.exec(
                select(Incident)
                .where(
                    Incident.monitor_id == monitor.id,
                    Incident.status == "open"
                )
            ).first()

            if not open_incident:
                incident = Incident(
                    monitor_id=monitor.id,
                    started_at=datetime.utcnow(),
                    status="open",
                    reason=str(e)
                )

                session.add(incident)

                print(
                    f"INCIDENT CREATED: "
                    f"{monitor.name}"
                )

            else:
                print(
                    f"INCIDENT STILL OPEN: "
                    f"{monitor.name}"
                )

            session.commit()

        except Exception:
            session.rollback()
            raise

        finally:
            session.close()

        print(
            f"{monitor.name}: DOWN "
            f"{response_time:.2f} ms "
            f"Reason: {e}"
        )

    print(
        f"Check completed for monitor: "
        f"{monitor.name}"
    )


@app.delete("/monitors/{monitor_id}")
def delete_monitor(
    monitor_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    monitor = session.exec(
        select(Monitor).where(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id
        )
    ).first()

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found"
        )

    scheduler.remove_job(f"monitor_{monitor.id}")

    session.delete(monitor)
    session.commit()

    return {
        "message": "Monitor deleted successfully",
        "monitor_id": monitor_id
    }


@app.post("/users", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    session: Session = Depends(get_session),
):
    existing_email = (
        session.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered",
        )

    existing_username = (
        session.query(User)
        .filter(User.username == user_data.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=409,
            detail="Username is already taken",
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


@app.post("/login", response_model=TokenResponse)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = (
        session.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user or not verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }