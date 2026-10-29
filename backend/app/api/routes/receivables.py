"""Receivables & Invoices endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api_schemas import ApiResponse, InvoiceItem
from app.services.receivables_service import receivables_service

router = APIRouter(tags=["Receivables"])


@router.get("/receivables", response_model=ApiResponse[list[InvoiceItem]])
@router.get("/business/{business_id}/receivables", response_model=ApiResponse[list[InvoiceItem]])
def get_receivables(
    business_id: str = "MSME0002",
    db: Session = Depends(get_db),
) -> ApiResponse[list[InvoiceItem]]:
    invoices = receivables_service.get_invoices(db, business_id)
    return ApiResponse(data=invoices)


@router.get("/invoices/{invoice_id}", response_model=ApiResponse[Optional[InvoiceItem]])
def get_invoice_by_id(
    invoice_id: str,
    db: Session = Depends(get_db),
) -> ApiResponse[Optional[InvoiceItem]]:
    invoice = receivables_service.get_invoice_by_id(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail=f"Invoice '{invoice_id}' not found.")
    return ApiResponse(data=invoice)
