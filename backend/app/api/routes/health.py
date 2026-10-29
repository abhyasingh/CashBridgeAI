"""Health & Readiness probe endpoints."""
from fastapi import APIRouter

from app.schemas.api_schemas import ApiResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=ApiResponse[dict])
def health_check() -> ApiResponse[dict]:
    return ApiResponse(
        data={
            "status": "healthy",
            "service": "CashBridge AI Core API",
            "version": "1.0.0",
            "snapshot_date": "2026-10-25",
        }
    )
