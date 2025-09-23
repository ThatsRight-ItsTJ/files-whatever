from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Any

T = TypeVar('T')

class StandardResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: str = ""