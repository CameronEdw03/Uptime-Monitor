from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from database import create_db_and_tables, get_session
from models import Monitor, CheckResult
from sqlmodel import Session, select

app = FastAPI()




class MonitorCreate(BaseModel):
    name: str
    url: str
    check_interval: int
    expected_status: int



@app.on_event("startup")
def on_startup():
    create_db_and_tables()

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