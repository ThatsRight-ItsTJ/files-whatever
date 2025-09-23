from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
import logging
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer

from models.user import User, UserCreate
from config.settings import settings

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = settings.jwt_secret
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create an access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create a refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None
    
    def get_current_user(self, token: str) -> Optional[str]:
        """Get current user ID from token"""
        payload = self.verify_token(token)
        if payload and payload.get("type") == "access":
            user_id: Optional[str] = payload.get("sub")
            if user_id:
                return user_id
        return None
    
    def sign_job_payload(self, payload: Dict[str, Any], user_id: str) -> str:
        """Sign a job payload with user-specific key"""
        # Create a unique key for this job
        job_key = f"{user_id}_{payload['task_id']}_{datetime.utcnow().isoformat()}"
        
        # Sign the payload
        signature = jwt.encode(
            {"job_key": job_key, "timestamp": datetime.utcnow().isoformat()},
            self.secret_key,
            algorithm=self.algorithm
        )
        
        return signature
    
    def verify_job_signature(self, payload: Dict[str, Any], signature: str, user_id: str) -> bool:
        """Verify job signature"""
        try:
            decoded = jwt.decode(signature, self.secret_key, algorithms=[self.algorithm])
            
            # Check if signature matches expected format
            timestamp_str = decoded.get("timestamp")
            if timestamp_str is None:
                return False
            expected_job_key = f"{user_id}_{payload['task_id']}_{payload['timestamp']}"
            
            return (
                decoded.get("job_key") == expected_job_key and
                abs(datetime.utcnow() - datetime.fromisoformat(timestamp_str)) < timedelta(minutes=5)
            )
            
        except JWTError:
            return False
    
    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password"""
        # This would typically check against a database
        # For now, return None (OAuth-based authentication)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        # This would typically fetch from a database
        # For now, return None
        return None
    
    async def get_all_users(self) -> List[User]:
        """Get all users"""
        # This would typically fetch from a database
        # For now, return empty list
        return []
    
    async def create_user(self, user_data: UserCreate) -> Optional[User]:
        """Create a new user"""
        # This would typically create in database
        # For now, return None
        return None

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials:
        if not credentials.credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        try:
            payload = jwt.decode(
                credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
            )
            username: str = payload.get("sub")
            if username is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            token_data = payload.get("user", {})
            user_id = token_data.get("id")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return user_id
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

security = HTTPBearer()

def get_current_user(credentials: str = Depends(security)):
    auth_service = AuthService()
    return auth_service.get_current_user(credentials)