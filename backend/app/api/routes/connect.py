"""Data Ingestion & Connector endpoints (Tally, QuickBooks, Bank AA, CSV)."""
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.connectors.csv_connector import csv_connector
from app.connectors.simulated_connectors import simulated_connectors
from app.connectors.tally_connector import tally_connector
from app.db.session import get_db
from app.schemas.api_schemas import ApiResponse, ConnectResponse

router = APIRouter(prefix="/connect", tags=["Connectors"])


@router.post("/{source}", response_model=ApiResponse[ConnectResponse])
async def connect_source(
    source: str,
    file: Optional[UploadFile] = File(None),
    businessId: str = "MSME0002",
    db: Session = Depends(get_db),
) -> ApiResponse[ConnectResponse]:
    source_lower = source.lower()

    if source_lower == "csv":
        if not file:
            # Simulate demo CSV connect if no file provided
            return ApiResponse(
                data=ConnectResponse(
                    sourceId="src_csv",
                    status="connected",
                    message="Demo CSV successfully validated and parsed. 14 invoices imported.",
                    recordsImported=14,
                )
            )
        contents = await file.read()
        res = csv_connector.validate_and_parse_csv(contents, file.filename or "upload.csv")
        return ApiResponse(
            data=ConnectResponse(
                sourceId="src_csv",
                status="connected",
                message=f"Uploaded CSV validated. {res.get('records_imported', 0)} records imported.",
                recordsImported=res.get("records_imported", 0),
            )
        )

    elif source_lower == "tally":
        if file:
            contents = await file.read()
            res = tally_connector.parse_tally_xml(contents)
            count = res.get("vouchers_found", 14)
        else:
            count = 14
        return ApiResponse(
            data=ConnectResponse(
                sourceId="src_tally",
                status="connected",
                message=f"Tally Prime connector active. {count} sales vouchers parsed and synced.",
                recordsImported=count,
            )
        )

    elif source_lower == "quickbooks":
        res = simulated_connectors.connect_quickbooks(businessId)
        return ApiResponse(
            data=ConnectResponse(
                sourceId="src_quickbooks",
                status="connected",
                message=res["message"],
                recordsImported=res["invoices_synced"],
            )
        )

    elif source_lower in ("bank", "account_aggregator", "aa"):
        res = simulated_connectors.connect_bank_aa(businessId)
        return ApiResponse(
            data=ConnectResponse(
                sourceId="src_aa",
                status="connected",
                message=res["message"],
                recordsImported=res["transactions_synced"],
            )
        )

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown source '{source}'. Allowed sources: tally, quickbooks, bank, csv",
        )
