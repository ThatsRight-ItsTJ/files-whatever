from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    username: str
    full_name: str
    password: Optional[str] = None  # For OAuth users, password is None

class User(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True