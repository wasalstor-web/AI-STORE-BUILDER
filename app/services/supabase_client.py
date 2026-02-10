"""
AI Store Builder — Supabase Client Service
Professional Supabase integration for real-time features and storage.
"""

import httpx
from functools import lru_cache
from typing import Any, Optional

from app.config import get_settings

settings = get_settings()


class SupabaseClient:
    """Professional Supabase client for AI Store Builder."""

    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.anon_key = settings.SUPABASE_KEY
        self.service_key = settings.SUPABASE_SERVICE_KEY
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def headers(self) -> dict:
        """Default headers for Supabase API calls."""
        return {
            "apikey": self.service_key or self.anon_key,
            "Authorization": f"Bearer {self.service_key or self.anon_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    @property
    def rest_url(self) -> str:
        """PostgREST API URL."""
        return f"{self.url}/rest/v1"

    @property
    def auth_url(self) -> str:
        """GoTrue Auth API URL."""
        return f"{self.url}/auth/v1"

    @property
    def storage_url(self) -> str:
        """Storage API URL."""
        return f"{self.url}/storage/v1"

    @property
    def realtime_url(self) -> str:
        """Realtime WebSocket URL."""
        ws_url = self.url.replace("http://", "ws://").replace("https://", "wss://")
        return f"{ws_url}/realtime/v1/websocket"

    async def get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                headers=self.headers,
            )
        return self._client

    async def close(self):
        """Close the HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # ══════════════════════════════════════════════════════════
    # Database Operations (PostgREST)
    # ══════════════════════════════════════════════════════════

    async def select(
        self,
        table: str,
        columns: str = "*",
        filters: Optional[dict] = None,
        order: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict]:
        """Select rows from a table."""
        client = await self.get_client()
        url = f"{self.rest_url}/{table}?select={columns}"

        if filters:
            for key, value in filters.items():
                url += f"&{key}=eq.{value}"
        if order:
            url += f"&order={order}"
        if limit:
            url += f"&limit={limit}"

        response = await client.get(url)
        response.raise_for_status()
        return response.json()

    async def insert(self, table: str, data: dict | list[dict]) -> list[dict]:
        """Insert rows into a table."""
        client = await self.get_client()
        url = f"{self.rest_url}/{table}"

        response = await client.post(url, json=data if isinstance(data, list) else [data])
        response.raise_for_status()
        return response.json()

    async def update(self, table: str, data: dict, filters: dict) -> list[dict]:
        """Update rows in a table."""
        client = await self.get_client()
        url = f"{self.rest_url}/{table}"

        for key, value in filters.items():
            url += f"?{key}=eq.{value}"

        response = await client.patch(url, json=data)
        response.raise_for_status()
        return response.json()

    async def delete(self, table: str, filters: dict) -> bool:
        """Delete rows from a table."""
        client = await self.get_client()
        url = f"{self.rest_url}/{table}"

        for key, value in filters.items():
            url += f"?{key}=eq.{value}"

        response = await client.delete(url)
        response.raise_for_status()
        return True

    async def rpc(self, function_name: str, params: Optional[dict] = None) -> Any:
        """Call a PostgreSQL function."""
        client = await self.get_client()
        url = f"{self.rest_url}/rpc/{function_name}"

        response = await client.post(url, json=params or {})
        response.raise_for_status()
        return response.json()

    # ══════════════════════════════════════════════════════════
    # AI Conversation Storage
    # ══════════════════════════════════════════════════════════

    async def save_ai_conversation(
        self,
        user_id: str,
        store_id: Optional[str],
        message: str,
        response: str,
        intent: Optional[str] = None,
        confidence: Optional[float] = None,
        execution_time: Optional[float] = None,
        html_before: Optional[str] = None,
        html_after: Optional[str] = None,
        suggestions: Optional[list] = None,
    ) -> dict:
        """Save an AI conversation for learning and analytics."""
        data = {
            "user_id": user_id,
            "store_id": store_id,
            "message": message,
            "response": response,
            "intent": intent,
            "confidence": confidence,
            "execution_time": execution_time,
            "html_before": html_before,
            "html_after": html_after,
            "suggestions": suggestions or [],
        }
        result = await self.insert("ai_conversations", data)
        return result[0] if result else {}

    async def get_user_conversations(
        self,
        user_id: str,
        limit: int = 50,
    ) -> list[dict]:
        """Get recent conversations for a user."""
        return await self.select(
            "ai_conversations",
            filters={"user_id": user_id},
            order="created_at.desc",
            limit=limit,
        )

    # ══════════════════════════════════════════════════════════
    # User Preferences
    # ══════════════════════════════════════════════════════════

    async def get_user_preferences(self, user_id: str) -> Optional[dict]:
        """Get user preferences."""
        result = await self.select(
            "user_preferences",
            filters={"user_id": user_id},
            limit=1,
        )
        return result[0] if result else None

    async def save_user_preferences(self, user_id: str, preferences: dict) -> dict:
        """Save or update user preferences."""
        existing = await self.get_user_preferences(user_id)
        if existing:
            result = await self.update(
                "user_preferences",
                preferences,
                {"user_id": user_id},
            )
        else:
            result = await self.insert(
                "user_preferences",
                {"user_id": user_id, **preferences},
            )
        return result[0] if result else {}

    # ══════════════════════════════════════════════════════════
    # Store Analytics
    # ══════════════════════════════════════════════════════════

    async def update_store_analytics(
        self,
        store_id: str,
        page_views: int = 0,
        unique_visitors: int = 0,
    ) -> dict:
        """Update store analytics."""
        existing = await self.select(
            "store_analytics",
            filters={"store_id": store_id},
            limit=1,
        )

        if existing:
            result = await self.update(
                "store_analytics",
                {
                    "page_views": existing[0].get("page_views", 0) + page_views,
                    "unique_visitors": existing[0].get("unique_visitors", 0) + unique_visitors,
                },
                {"store_id": store_id},
            )
        else:
            result = await self.insert(
                "store_analytics",
                {
                    "store_id": store_id,
                    "page_views": page_views,
                    "unique_visitors": unique_visitors,
                },
            )
        return result[0] if result else {}

    # ══════════════════════════════════════════════════════════
    # Health Check
    # ══════════════════════════════════════════════════════════

    async def health_check(self) -> dict:
        """Check Supabase connection health."""
        try:
            client = await self.get_client()
            response = await client.get(f"{self.rest_url}/")
            return {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "url": self.url,
                "response_time_ms": response.elapsed.total_seconds() * 1000,
            }
        except Exception as e:
            return {
                "status": "error",
                "url": self.url,
                "error": str(e),
            }


# ══════════════════════════════════════════════════════════
# Singleton Instance
# ══════════════════════════════════════════════════════════

@lru_cache
def get_supabase_client() -> SupabaseClient:
    """Get the Supabase client singleton."""
    return SupabaseClient()


# ══════════════════════════════════════════════════════════
# FastAPI Dependency
# ══════════════════════════════════════════════════════════

async def get_supabase() -> SupabaseClient:
    """FastAPI dependency for Supabase client."""
    return get_supabase_client()
