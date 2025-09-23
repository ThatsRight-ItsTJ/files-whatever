"""
Authentication service for Vibe Coding Tool
"""

import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.settings import settings
from models.user import User, UserStatus, OAuthAccount, OAuthProvider
from models.response import AuthResponse, ErrorResponse
from utils.rate_limiter import RateLimiter
from utils.crypto import hash_password, verify_password, generate_salt

# Security
security = HTTPBearer()

class AuthService:
    """Authentication service for handling user authentication and authorization"""
    
    def __init__(self):
        self.rate_limiter = RateLimiter()
        self.blacklisted_tokens = set()
        self.refresh_token_store = {}
        
    async def create_user(
        self, 
        username: str, 
        email: str, 
        password: Optional[str] = None,
        role: str = "user",
        preferences: Optional[Dict[str, Any]] = None
    ) -> User:
        """Create a new user account"""
        # Check if username already exists
        existing_user = await self.get_user_by_username(username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Check if email already exists
        existing_email = await self.get_user_by_email(email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        
        # Create user
        user = User(
            username=username,
            email=email,
            role=role,
            preferences=preferences or {}
        )
        
        # Hash password if provided
        if password:
            salt = generate_salt()
            user.password_hash = hash_password(password, salt)
            user.password_salt = salt
        
        # Save user to database
        await self.save_user(user)
        
        return user
    
    async def authenticate_user(
        self, 
        username: str, 
        password: str
    ) -> Optional[User]:
        """Authenticate user with username and password"""
        user = await self.get_user_by_username(username)
        if not user:
            return None
        
        if user.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not active"
            )
        
        # Verify password
        if not verify_password(password, user.password_hash, user.password_salt):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        await self.save_user(user)
        
        return user
    
    async def authenticate_oauth(
        self, 
        provider: OAuthProvider, 
        provider_user_id: str, 
        access_token: str,
        refresh_token: Optional[str] = None,
        scope: Optional[List[str]] = None
    ) -> User:
        """Authenticate user with OAuth provider"""
        # Check if OAuth account exists
        oauth_account = await self.get_oauth_account(provider, provider_user_id)
        
        if oauth_account:
            # Update OAuth account tokens
            oauth_account.access_token = access_token
            oauth_account.refresh_token = refresh_token
            oauth_account.scope = scope or []
            oauth_account.updated_at = datetime.utcnow()
            
            await self.save_oauth_account(oauth_account)
            
            # Return associated user
            return await self.get_user(oauth_account.user_id)
        else:
            # Create new user or link to existing user
            user = await self.create_user_from_oauth(
                provider, provider_user_id, access_token, refresh_token, scope
            )
            
            return user
    
    async def create_user_from_oauth(
        self, 
        provider: OAuthProvider, 
        provider_user_id: str, 
        access_token: str,
        refresh_token: Optional[str] = None,
        scope: Optional[List[str]] = None
    ) -> User:
        """Create user from OAuth provider"""
        # Generate username from provider and provider user ID
        username = f"{provider.value}_{provider_user_id}"
        
        # Check if username exists, if so append random string
        existing_user = await self.get_user_by_username(username)
        if existing_user:
            username = f"{username}_{secrets.token_hex(4)}"
        
        # Create user
        user = await self.create_user(
            username=username,
            email=f"{username}@oauth.local",
            role="user"
        )
        
        # Create OAuth account
        oauth_account = OAuthAccount(
            user_id=user.id,
            provider=provider,
            provider_user_id=provider_user_id,
            access_token=access_token,
            refresh_token=refresh_token,
            scope=scope or []
        )
        
        await self.save_oauth_account(oauth_account)
        
        return user
    
    async def create_access_token(self, user: User) -> str:
        """Create JWT access token for user"""
        payload = {
            "sub": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes),
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
        return token
    
    async def create_refresh_token(self, user: User) -> str:
        """Create JWT refresh token for user"""
        token = secrets.token_urlsafe(32)
        
        # Store refresh token
        self.refresh_token_store[token] = {
            "user_id": user.id,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days)
        }
        
        return token
    
    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token and return payload"""
        try:
            # Check if token is blacklisted
            if token in self.blacklisted_tokens:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked"
                )
            
            payload = jwt.decode(
                token, 
                settings.jwt_secret_key, 
                algorithms=[settings.jwt_algorithm]
            )
            
            # Check token type
            if payload.get("type") not in ["access", "refresh"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    async def refresh_access_token(self, refresh_token: str) -> str:
        """Refresh access token using refresh token"""
        # Verify refresh token
        payload = await self.verify_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check if refresh token exists in store
        if refresh_token not in self.refresh_token_store:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not found"
            )
        
        # Get user info from store
        token_info = self.refresh_token_store[refresh_token]
        
        # Check if refresh token is expired
        if datetime.utcnow() > token_info["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired"
            )
        
        # Get user
        user = await self.get_user(token_info["user_id"])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new access token
        new_access_token = await self.create_access_token(user)
        
        return new_access_token
    
    async def revoke_token(self, token: str) -> bool:
        """Revoke a token"""
        try:
            payload = jwt.decode(
                token, 
                settings.jwt_secret_key, 
                algorithms=[settings.jwt_algorithm]
            )
            
            # Add to blacklist
            self.blacklisted_tokens.add(token)
            
            # If refresh token, remove from store
            if payload.get("type") == "refresh":
                self.refresh_token_store.pop(token, None)
            
            return True
            
        except jwt.JWTError:
            return False
    
    async def get_current_user(
        self, 
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> User:
        """Get current user from JWT token"""
        token = credentials.credentials
        
        # Verify token
        payload = await self.verify_token(token)
        
        # Get user
        user = await self.get_user(payload["sub"])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    
    async def get_current_active_user(
        self, 
        current_user: User = Depends(get_current_user)
    ) -> User:
        """Get current active user"""
        if current_user.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        return current_user
    
    async def get_current_admin_user(
        self, 
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        """Get current admin user"""
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    
    # Database operations (to be implemented with actual database)
    async def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        # TODO: Implement database query
        return None
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        # TODO: Implement database query
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        # TODO: Implement database query
        return None
    
    async def save_user(self, user: User) -> User:
        """Save user to database"""
        # TODO: Implement database save
        return user
    
    async def get_oauth_account(
        self, 
        provider: OAuthProvider, 
        provider_user_id: str
    ) -> Optional[OAuthAccount]:
        """Get OAuth account by provider and provider user ID"""
        # TODO: Implement database query
        return None
    
    async def save_oauth_account(self, oauth_account: OAuthAccount) -> OAuthAccount:
        """Save OAuth account to database"""
        # TODO: Implement database save
        return oauth_account
    
    async def cleanup_expired_tokens(self):
        """Clean up expired tokens"""
        # Clean up refresh tokens
        current_time = datetime.utcnow()
        expired_tokens = [
            token for token, info in self.refresh_token_store.items()
            if current_time > info["expires_at"]
        ]
        
        for token in expired_tokens:
            self.refresh_token_store.pop(token, None)
        
        # Clean up blacklisted tokens (keep recent ones)
        # TODO: Implement cleanup logic
    
    async def change_password(
        self, 
        user: User, 
        old_password: str, 
        new_password: str
    ) -> bool:
        """Change user password"""
        # Verify old password
        if not verify_password(old_password, user.password_hash, user.password_salt):
            return False
        
        # Hash new password
        salt = generate_salt()
        user.password_hash = hash_password(new_password, salt)
        user.password_salt = salt
        
        # Save user
        await self.save_user(user)
        
        return True
    
    async def reset_password(self, user_id: str, new_password: str) -> bool:
        """Reset user password"""
        user = await self.get_user(user_id)
        if not user:
            return False
        
        # Hash new password
        salt = generate_salt()
        user.password_hash = hash_password(new_password, salt)
        user.password_salt = salt
        
        # Save user
        await self.save_user(user)
        
        return True
    
    async def update_user_preferences(
        self, 
        user: User, 
        preferences: Dict[str, Any]
    ) -> User:
        """Update user preferences"""
        user.preferences.update(preferences)
        await self.save_user(user)
        return user
    
    async def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        user = await self.get_user(user_id)
        if not user:
            return False
        
        user.status = UserStatus.INACTIVE
        await self.save_user(user)
        
        return True
    
    async def activate_user(self, user_id: str) -> bool:
        """Activate user account"""
        user = await self.get_user(user_id)
        if not user:
            return False
        
        user.status = UserStatus.ACTIVE
        await self.save_user(user)
        
        return True


# Dependency functions for FastAPI
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends()
) -> User:
    """Get current user dependency"""
    return await auth_service.get_current_user(credentials)


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends()
) -> User:
    """Get current active user dependency"""
    return await auth_service.get_current_active_user(current_user)


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends()
) -> User:
    """Get current admin user dependency"""
    return await auth_service.get_current_admin_user(current_user)