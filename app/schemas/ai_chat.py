"""AI Chat schemas — request/response models for AI endpoints."""

from typing import Optional

from pydantic import BaseModel


class AIChatRequest(BaseModel):
    """Request for AI HTML generation."""
    message: str
    current_html: str
    store_name: str = "متجري"
    store_type: str = "general"
    store_id: Optional[str] = None
    context: Optional[dict] = None


class AIChatResponse(BaseModel):
    """Response with generated HTML."""
    html: str
    message: str
    suggestions: list[str] = []
    execution_time: float = 0.0


class AIConversationRequest(BaseModel):
    """Request for conversational AI (no HTML generation)."""
    message: str
    conversation_history: list[dict] = []
    store_name: str = "متجري"
    store_type: str = "general"


class AIConversationResponse(BaseModel):
    """Response for conversational AI."""
    reply: str
    suggestions: list[str] = []
    should_execute: bool = False
    execution_time: float = 0.0
