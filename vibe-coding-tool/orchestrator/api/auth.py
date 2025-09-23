"""
Authentication API endpoints for Vibe Coding Tool
"""

import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode

from models.user import User, UserCreate, UserUpdate
from models.response import StandardResponse
from core.auth_service import AuthService, get_current_user, get_current_active_user
from config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.post("/auth/register", response_model=StandardResponse[User])
async def register_user(
    user: UserCreate,
    auth_service: AuthService = Depends()
):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await auth_service.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create user
        created_user = await auth_service.create_user(user)
        
        return StandardResponse(
            success=True,
            data=created_user,
            message="User registered successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/login", response_model=StandardResponse[dict])
async def login_user(
    email: str,
    password: str,
    auth_service: AuthService = Depends()
):
    """Login user"""
    try:
        # Authenticate user
        user = await auth_service.authenticate_user(email, password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create access token
        access_token = await auth_service.create_access_token(user.id)
        
        # Create refresh token
        refresh_token = await auth_service.create_refresh_token(user.id)
        
        return StandardResponse(
            success=True,
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": settings.jwt_access_token_expire_minutes * 60,
                "user": user
            },
            message="Login successful"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/refresh", response_model=StandardResponse[dict])
async def refresh_token(
    refresh_token: str,
    auth_service: AuthService = Depends()
):
    """Refresh access token"""
    try:
        # Verify refresh token
        user_id = await auth_service.verify_refresh_token(refresh_token)
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        # Create new access token
        access_token = await auth_service.create_access_token(user_id)
        
        return StandardResponse(
            success=True,
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.jwt_access_token_expire_minutes * 60
            },
            message="Token refreshed successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/logout", response_model=StandardResponse[dict])
async def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends()
):
    """Logout user"""
    try:
        # Get token from authorization header
        token = credentials.credentials
        
        # Invalidate token
        await auth_service.invalidate_token(token)
        
        return StandardResponse(
            success=True,
            data={"message": "Logged out successfully"},
            message="Logout successful"
        )
    
    except Exception as e:
        logger.error(f"Error logging out user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/auth/me", response_model=StandardResponse[User])
async def get_current_user_info(
    current_user: str = Depends(get_current_active_user),
    auth_service: AuthService = Depends()
):
    """Get current user information"""
    try:
        user = await auth_service.get_user(current_user)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return StandardResponse(
            success=True,
            data=user,
            message="User information retrieved successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/auth/me", response_model=StandardResponse[User])
async def update_current_user(
    user_update: UserUpdate,
    current_user: str = Depends(get_current_active_user),
    auth_service: AuthService = Depends()
):
    """Update current user information"""
    try:
        updated_user = await auth_service.update_user(current_user, user_update)
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return StandardResponse(
            success=True,
            data=updated_user,
            message="User information updated successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating current user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/change-password", response_model=StandardResponse[dict])
async def change_password(
    current_password: str,
    new_password: str,
    current_user: str = Depends(get_current_active_user),
    auth_service: AuthService = Depends()
):
    """Change user password"""
    try:
        # Verify current password
        user = await auth_service.get_user(current_user)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not await auth_service.verify_password(current_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Update password
        await auth_service.update_password(current_user, new_password)
        
        return StandardResponse(
            success=True,
            data={"message": "Password changed successfully"},
            message="Password changed successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/forgot-password", response_model=StandardResponse[dict])
async def forgot_password(
    email: str,
    auth_service: AuthService = Depends()
):
    """Initiate password reset"""
    try:
        # Check if user exists
        user = await auth_service.get_user_by_email(email)
        if not user:
            # Don't reveal if email exists or not for security
            return StandardResponse(
                success=True,
                data={"message": "If the email exists, a reset link has been sent"},
                message="Password reset email sent"
            )
        
        # Create password reset token
        reset_token = await auth_service.create_password_reset_token(user.id)
        
        # TODO: Send password reset email
        # For now, just return success
        logger.info(f"Password reset token created for user {user.id}")
        
        return StandardResponse(
            success=True,
            data={"message": "If the email exists, a reset link has been sent"},
            message="Password reset email sent"
        )
    
    except Exception as e:
        logger.error(f"Error initiating password reset: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/reset-password", response_model=StandardResponse[dict])
async def reset_password(
    reset_token: str,
    new_password: str,
    auth_service: AuthService = Depends()
):
    """Reset password using token"""
    try:
        # Verify reset token
        user_id = await auth_service.verify_password_reset_token(reset_token)
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Update password
        await auth_service.update_password(user_id, new_password)
        
        return StandardResponse(
            success=True,
            data={"message": "Password reset successfully"},
            message="Password reset successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/auth/github", response_class=RedirectResponse)
async def github_login():
    """Redirect to GitHub OAuth"""
    github_auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={settings.github_client_id}"
        f"&redirect_uri={settings.github_redirect_uri}"
        f"&scope=user:email,repo"
    )
    return RedirectResponse(github_auth_url)

@router.get("/auth/github/callback", response_model=StandardResponse[dict])
async def github_callback(
    code: str,
    request: Request,
    auth_service: AuthService = Depends()
):
    """GitHub OAuth callback"""
    try:
        # Exchange code for access token
        github_token = await auth_service.exchange_github_code_for_token(code)
        
        # Get user info from GitHub
        github_user = await auth_service.get_github_user_info(github_token)
        
        # Find or create user
        user = await auth_service.get_or_create_user_from_github(github_user)
        
        # Create access token
        access_token = await auth_service.create_access_token(user.id)
        
        # Create refresh token
        refresh_token = await auth_service.create_refresh_token(user.id)
        
        return StandardResponse(
            success=True,
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": settings.jwt_access_token_expire_minutes * 60,
                "user": user
            },
            message="GitHub login successful"
        )
    
    except Exception as e:
        logger.error(f"Error in GitHub callback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/auth/huggingface", response_class=RedirectResponse)
async def huggingface_login():
    """Redirect to HuggingFace OAuth"""
    hf_auth_url = (
        f"https://huggingface.co/oauth/authorize?"
        f"client_id={settings.hf_client_id}"
        f"&redirect_uri={settings.hf_redirect_uri}"
        f"&scope=read,write"
    )
    return RedirectResponse(hf_auth_url)

@router.get("/auth/huggingface/callback", response_model=StandardResponse[dict])
async def huggingface_callback(
    code: str,
    request: Request,
    auth_service: AuthService = Depends()
):
    """HuggingFace OAuth callback"""
    try:
        # Exchange code for access token
        hf_token = await auth_service.exchange_hf_code_for_token(code)
        
        # Get user info from HuggingFace
        hf_user = await auth_service.get_hf_user_info(hf_token)
        
        # Find or create user
        user = await auth_service.get_or_create_user_from_hf(hf_user)
        
        # Create access token
        access_token = await auth_service.create_access_token(user.id)
        
        # Create refresh token
        refresh_token = await auth_service.create_refresh_token(user.id)
        
        return StandardResponse(
            success=True,
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": settings.jwt_access_token_expire_minutes * 60,
                "user": user
            },
            message="HuggingFace login successful"
        )
    
    except Exception as e:
        logger.error(f"Error in HuggingFace callback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/link-github", response_model=StandardResponse[dict])
async def link_github_account(
    code: str,
    current_user: str = Depends(get_current_active_user),
    auth_service: AuthService = Depends()
):
    """Link GitHub account to current user"""
    try:
        # Exchange code for access token
        github_token = await auth_service.exchange_github_code_for_token(code)
        
        # Get user info from GitHub
        github_user = await auth_service.get_github_user_info(github_token)
        
        # Link GitHub account
        success = await auth_service.link_github_account(current_user, github_user, github_token)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to link GitHub account")
        
        return StandardResponse(
            success=True,
            data={"message": "GitHub account linked successfully"},
            message="GitHub account linked successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking GitHub account: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/link-huggingface", response_model=StandardResponse[dict])
async def link_huggingface_account(
    code: str,
    current_user: str = Depends(get_current_active_user),
    auth_service: AuthService = Depends()
):
    """Link HuggingFace account to current user"""
    try:
        # Exchange code for access token
        hf_token = await auth_service.exchange_hf_code_for_token(code)
        
        # Get user info from HuggingFace
        hf_user = await auth_service.get_hf_user_info(hf_token)
        
        # Link HuggingFace account
        success = await auth_service.link_hf_account(current_user, hf_user, hf_token)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to link HuggingFace account")
        
        return StandardResponse(
            success=True,
            data={"message": "HuggingFace account linked successfully"},
            message="HuggingFace account linked successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking HuggingFace account: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/auth/unlink-github", response_model=StandardResponse[dict])
async def unlink_github_account(
    current_user: str = Depends(get_current_active_user),
    auth_service: AuthService = Depends()
):
    """Unlink GitHub account from current user"""
    try:
        success = await auth_service.unlink_github_account(current_user)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to unlink GitHub account")
        
        return StandardResponse(
            success=True,
            data={"message": "GitHub account unlinked successfully"},
            message="GitHub account unlinked successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unlinking GitHub account: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/auth/unlink-huggingface", response_model=StandardResponse[dict])
async def unlink_huggingface_account(
    current_user: str = Depends(get_current_active_user),
    auth_service: AuthService = Depends()
):
    """Unlink HuggingFace account from current user"""
    try:
        success = await auth_service.unlink_hf_account(current_user)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to unlink HuggingFace account")
        
        return StandardResponse(
            success=True,
            data={"message": "HuggingFace account unlinked successfully"},
            message="HuggingFace account unlinked successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unlinking HuggingFace account: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/auth/linked-accounts", response_model=StandardResponse[dict])
async def get_linked_accounts(
    current_user: str = Depends(get_current_active_user),
    auth_service: AuthService = Depends()
):
    """Get linked accounts for current user"""
    try:
        linked_accounts = await auth_service.get_linked_accounts(current_user)
        
        return StandardResponse(
            success=True,
            data=linked_accounts,
            message="Linked accounts retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting linked accounts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))