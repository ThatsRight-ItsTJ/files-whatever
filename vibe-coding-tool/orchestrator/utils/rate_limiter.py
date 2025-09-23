"""
Rate limiter for Vibe Coding Tool
"""

import time
import asyncio
from typing import Dict, Optional
from collections import defaultdict, deque

class RateLimiter:
    """Simple rate limiter using sliding window"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(deque)
    
    async def is_allowed(self, key: str) -> bool:
        """Check if request is allowed based on rate limit"""
        current_time = time.time()
        
        # Clean old requests
        while self.requests[key] and current_time - self.requests[key][0] > self.window_seconds:
            self.requests[key].popleft()
        
        # Check if request is allowed
        if len(self.requests[key]) < self.max_requests:
            self.requests[key].append(current_time)
            return True
        
        return False
    
    async def wait_if_needed(self, key: str) -> None:
        """Wait if rate limit is exceeded"""
        if not await self.is_allowed(key):
            sleep_time = self.window_seconds - (time.time() - self.requests[key][0])
            await asyncio.sleep(sleep_time)