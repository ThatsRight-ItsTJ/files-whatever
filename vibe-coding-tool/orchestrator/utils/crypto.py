"""
Cryptographic utilities for Vibe Coding Tool
"""

import hashlib
import secrets
import os
from typing import Tuple

def hash_password(password: str, salt: str) -> str:
    """Hash password with salt using SHA-256"""
    salted_password = password + salt
    return hashlib.sha256(salted_password.encode()).hexdigest()

def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """Verify password against hash"""
    computed_hash = hash_password(password, salt)
    return secrets.compare_digest(computed_hash, password_hash)

def generate_salt(length: int = 32) -> str:
    """Generate a random salt"""
    return secrets.token_hex(length)

def generate_api_key() -> str:
    """Generate a random API key"""
    return secrets.token_urlsafe(32)

def generate_session_id() -> str:
    """Generate a random session ID"""
    return secrets.token_hex(16)

def secure_compare(a: str, b: str) -> bool:
    """Constant-time string comparison for security"""
    return secrets.compare_digest(a, b)

def generate_random_string(length: int = 16) -> str:
    """Generate a random string"""
    return secrets.token_hex(length)