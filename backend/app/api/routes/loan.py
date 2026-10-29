"""Bridge Micro-Loan endpoints: pre-approved offer generation and one-tap consent-based disbursal."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api_schemas import (
    ApiResponse,
    LoanAcceptRequest,
    LoanAcceptResponse,
    LoanOffer,
    LoanOfferRequest,
)
from app.services.loan_service import loan_service

router = APIRouter(prefix="/loan", tags=["Lending"])


@router.get("/offer", response_model=ApiResponse[LoanOffer])
def get_loan_offer_get(
    business_id: str = "MSME0002",
    db: Session = Depends(get_db),
) -> ApiResponse[LoanOffer]:
    offer = loan_service.get_offer(db, LoanOfferRequest(businessId=business_id))
    return ApiResponse(data=offer)


@router.post("/offer", response_model=ApiResponse[LoanOffer])
def get_loan_offer_post(
    request: LoanOfferRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[LoanOffer]:
    offer = loan_service.get_offer(db, request)
    return ApiResponse(data=offer)


@router.post("/accept", response_model=ApiResponse[LoanAcceptResponse])
def accept_loan(
    request: LoanAcceptRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[LoanAcceptResponse]:
    if not request.consentAgreed:
        raise HTTPException(
            status_code=400,
            detail="Regulatory consent agreement is required before credit disbursal.",
        )
    try:
        res = loan_service.accept_loan(db, request)
        return ApiResponse(data=res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
