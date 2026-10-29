"""13-Week Cash Forecast endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api_schemas import ApiResponse, ForecastDataPoint
from app.services.forecast_service import forecast_service

router = APIRouter(tags=["Forecast"])


@router.get("/forecast", response_model=ApiResponse[list[ForecastDataPoint]])
@router.get("/business/{business_id}/forecast", response_model=ApiResponse[list[ForecastDataPoint]])
def get_13_week_forecast(
    business_id: str = "MSME0002",
    db: Session = Depends(get_db),
) -> ApiResponse[list[ForecastDataPoint]]:
    points = forecast_service.get_13_week_forecast(db, business_id)
    return ApiResponse(data=points)
