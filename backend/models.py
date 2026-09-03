from typing import Optional

from sqlmodel import SQLModel, Field
from datetime import datetime

class Monitor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    url: str 
    check_interval: int
    expected_status: int

class CheckResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    monitor_id: int = Field(foreign_key="monitor.id")
    status_code: Optional[int] = None
    response_time: float
    is_up: bool
    error_message: Optional[str] = None
    checked_at: datetime = Field(default_factory=datetime.utcnow)



class Incident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    monitor_id: int = Field(foreign_key="monitor.id")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    status: str = Field(default="open")
    reason: Optional[str] = None