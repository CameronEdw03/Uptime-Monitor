from typing import Optional

from sqlmodel import SQLModel, Field
from datetime import datetime

class Monitor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    url: str 
    check_interval: int
    expected_status: int
    user_id: int = Field(foreign_key="user.id")

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
    status: str = Field(default="active")
    reason: Optional[str] = None

class UserCreate(SQLModel):
    username: str
    email: str
    password: str

class UserResponse(SQLModel):
    id: int 
    username: str
    email: str 
    role: str

class UserLogin(SQLModel):
    email: str
    password: str

class TokenResponse(SQLModel):
    access_token: str
    token_type: str

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = Field(default="help_desk", index=True)