"""Gap Alerts & Explainability ("Why?") endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api_schemas import (
    ApiResponse,
    GapAlertItem,
    LiveTickerItem,
    ShortfallAnalysis,
)
from app.services.forecast_service import forecast_service

router = APIRouter(tags=["Alerts"])


@router.get("/alerts", response_model=ApiResponse[list[GapAlertItem]])
@router.get("/business/{business_id}/alerts", response_model=ApiResponse[list[GapAlertItem]])
def get_gap_alerts(
    business_id: str = "MSME0002",
    db: Session = Depends(get_db),
) -> ApiResponse[list[GapAlertItem]]:
    alerts = forecast_service.get_alerts(db, business_id)
    return ApiResponse(data=alerts)


@router.get("/alerts/ticker", response_model=ApiResponse[list[LiveTickerItem]])
def get_live_ticker(db: Session = Depends(get_db)) -> ApiResponse[list[LiveTickerItem]]:
    ticker = forecast_service.get_live_ticker(db)
    return ApiResponse(data=ticker)


@router.get("/alerts/shortfall-analysis", response_model=ApiResponse[ShortfallAnalysis])
@router.get("/alerts/{alert_id}/explain", response_model=ApiResponse[ShortfallAnalysis])
def explain_gap_alert(
    alert_id: str = "alt_gap_01",
    lang: str = Query("en", pattern="^(en|hi)$"),
    db: Session = Depends(get_db),
) -> ApiResponse[ShortfallAnalysis]:
    analysis = forecast_service.get_shortfall_analysis(db, alert_id, lang)
    return ApiResponse(data=analysis)
