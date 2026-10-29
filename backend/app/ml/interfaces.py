"""Machine Learning Interfaces for CashBridge AI.

Defines the clean contracts for:
1. InvoiceDelayPredictor: predicts expected payment delay days and payment reliability score.
2. CashForecastEngine: generates 13-week Monte Carlo probabilistic cash projections (P10/P50/P90).
"""
from __future__ import annotations

import abc
import datetime
from typing import Optional

from pydantic import BaseModel


class DelayPrediction(BaseModel):
    invoice_id: str
    expected_delay_days: int
    predicted_pay_date: datetime.date
    payment_reliability_score: int  # 0 to 100
    risk_tier: str  # "critical", "moderate", "safe"
    confidence_score: float  # 0.0 to 1.0


class InvoiceDelayPredictor(abc.ABC):
    @abc.abstractmethod
    def predict_delay(
        self,
        invoice_id: str,
        due_date: datetime.date,
        customer_avg_prior_delay_days: Optional[float] = None,
        customer_prior_late_rate: Optional[float] = None,
        customer_type: Optional[str] = None,
        invoice_amount: Optional[float] = None,
    ) -> DelayPrediction:
        """Predicts delay days and reliability score for an invoice."""
        pass


class WeeklyForecastPoint(BaseModel):
    week_index: int
    day_offset: int
    date_str: str
    p10: float
    p50: float
    p90: float
    min_buffer: float
    deficit_amount: float
    is_deficit: bool
    event_note: Optional[str] = None


class CashForecastEngine(abc.ABC):
    @abc.abstractmethod
    def generate_13_week_forecast(
        self,
        business_id: str,
        start_balance: float,
        min_buffer: float,
        open_invoices: list[dict],
        recurring_commitments: list[dict],
        n_simulations: int = 1000,
    ) -> list[WeeklyForecastPoint]:
        """Generates 13-week Monte Carlo forecast points."""
        pass
