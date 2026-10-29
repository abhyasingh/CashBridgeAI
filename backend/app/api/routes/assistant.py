"""Khata AI Assistant conversational endpoint (English + Hindi)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api_schemas import (
    ApiResponse,
    AssistantAskRequest,
    AssistantAskResponse,
)
from app.services.assistant_service import assistant_service

router = APIRouter(prefix="/assistant", tags=["Assistant"])


@router.post("/ask", response_model=ApiResponse[AssistantAskResponse])
def ask_assistant(
    request: AssistantAskRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[AssistantAskResponse]:
    res = assistant_service.ask(db, request)
    return ApiResponse(data=res)
