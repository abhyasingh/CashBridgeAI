"""Business endpoints: profile and executive summary."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api_schemas import ApiResponse, BusinessProfile, BusinessSummary
from app.services.business_service import business_service

router = APIRouter(prefix="/business", tags=["Business"])


@router.get("/profile", response_model=ApiResponse[BusinessProfile])
@router.get("/{business_id}/profile", response_model=ApiResponse[BusinessProfile])
def get_business_profile(
    business_id: str = "MSME0002",
    db: Session = Depends(get_db),
) -> ApiResponse[BusinessProfile]:
    profile = business_service.get_profile(db, business_id)
    return ApiResponse(data=profile)


@router.get("/summary", response_model=ApiResponse[BusinessSummary])
@router.get("/{business_id}/summary", response_model=ApiResponse[BusinessSummary])
def get_business_summary(
    business_id: str = "MSME0002",
    db: Session = Depends(get_db),
) -> ApiResponse[BusinessSummary]:
    summary = business_service.get_summary(db, business_id)
    return ApiResponse(data=summary)
