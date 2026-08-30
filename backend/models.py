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
    status_code: int
    response_time: float
    is_up: bool
    error_message: Optional[str] = None
    checked_at: datetime = Field(default_factory=datetime.utcnow)