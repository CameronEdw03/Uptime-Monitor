import httpx
import time
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from database import create_db_and_tables, get_session
from models import Monitor, CheckResult
from sqlmodel import Session, select
from apscheduler.schedulers.background import BackgroundScheduler


app = FastAPI()




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

    monitors = session.exec(
        select(Monitor)
    ).all()

    for monitor in monitors:
        scheduler.add_job(
            check_monitor,
            "interval",
            seconds=monitor.check_interval,
            args=[monitor.id],
            id=f"monitor_{monitor.id}",
            replace_existing=True
        )

    scheduler.start()

    session.close()

@app.post("/monitors")
def create_monitor(monitor: MonitorCreate, session: Session = Depends(get_session)):

    db_monitor = Monitor(
        name=monitor.name,
        url=monitor.url,
        check_interval=monitor.check_interval,
        expected_status=monitor.expected_status
    )
    session.add(db_monitor)
    session.commit()
    session.refresh(db_monitor)
    return db_monitor


@app.get("/monitors")
def read_monitors(session: Session = Depends(get_session)):
    monitors = session.exec(select(Monitor)).all()
    statement = select(Monitor)
    return monitors

@app.get("/monitors/{monitor_id}")
def read_monitor(monitor_id: int, session: Session = Depends(get_session)):
    monitor = session.get(Monitor, monitor_id)
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")
    return monitor


@app.post("/monitors/{monitor_id}/check_results")
def create_check_result(monitor_id: int, check_result: CheckResult, session: Session = Depends(get_session)):
    monitor = session.get(Monitor, monitor_id)
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")

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
def read_check_results(monitor_id: int, session: Session = Depends(get_session)):
    monitor = session.get(Monitor, monitor_id)
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")

    check_results = session.exec(select(CheckResult).where(CheckResult.monitor_id == monitor_id)).all()
    return check_results

@app.get("/check_results")
def read_all_check_results(session: Session = Depends(get_session)):
    check_results = session.exec(select(CheckResult)).all()
    return check_results

def check_monitor(monitor_id: int):
    session = next(get_session())

    monitor = session.get(Monitor, monitor_id)

    if not monitor:
        session.close()
        return

    start_time = time.perf_counter()

    try:
        response = httpx.get(
            monitor.url,
            timeout=10
        )

        end_time = time.perf_counter()

        response_time = (end_time - start_time) * 1000

        is_up = response.status_code == monitor.expected_status

        check_result = CheckResult(
            monitor_id=monitor.id,
            status_code=response.status_code,
            response_time=response_time,
            is_up=is_up,
            error_message=None
        )

        session.add(check_result)
        session.commit()

        print(
            f"{monitor.name}: "
            f"{'UP' if is_up else 'DOWN'} "
            f"{response.status_code} "
            f"{response_time:.2f} ms"
        )

    except httpx.RequestError as e:

        end_time = time.perf_counter()

        response_time = (end_time - start_time) * 1000

        check_result = CheckResult(
            monitor_id=monitor.id,
            status_code=None,
            response_time=response_time,
            is_up=False,
            error_message=str(e)
        )

        session.add(check_result)
        session.commit()

        print(f"{monitor.name}: DOWN")

    session.close()

