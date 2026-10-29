"""Baseline Invoice Delay Predictor implementing InvoiceDelayPredictor interface.

Uses historical customer delay habits, segment fallback, and Bayesian shrinkage
to predict actual realization dates for open invoices.
"""
from __future__ import annotations

import datetime
from typing import Optional

from app.ml.interfaces import DelayPrediction, InvoiceDelayPredictor

SEGMENT_AVERAGE_DELAYS: dict[str, float] = {
    "Large Corporate": 34.0,
    "Govt-PSU": 48.0,
    "Other MSME": 16.0,
    "Distributor-Dealer": 11.0,
    "Retail-Individual": 4.0,
}


class BaselineDelayPredictor(InvoiceDelayPredictor):
    def predict_delay(
        self,
        invoice_id: str,
        due_date: datetime.date,
        customer_avg_prior_delay_days: Optional[float] = None,
        customer_prior_late_rate: Optional[float] = None,
        customer_type: Optional[str] = None,
        invoice_amount: Optional[float] = None,
    ) -> DelayPrediction:
        # Fallback to customer type segment prior delay if customer history is absent
        segment_prior = SEGMENT_AVERAGE_DELAYS.get(customer_type or "Other MSME", 18.0)
        
        if customer_avg_prior_delay_days is not None and customer_avg_prior_delay_days >= 0:
            # Weighted average between customer-specific history and segment prior
            expected_delay = int(round(0.85 * customer_avg_prior_delay_days + 0.15 * segment_prior))
        else:
            expected_delay = int(round(segment_prior))

        # Determine reliability score (0-100)
        late_rate = customer_prior_late_rate if customer_prior_late_rate is not None else 0.50
        base_score = max(5, min(95, int(100 - (expected_delay * 1.5 + late_rate * 40))))

        # Risk tiering
        if expected_delay > 25 or base_score < 45:
            risk_tier = "critical"
        elif expected_delay > 10 or base_score < 70:
            risk_tier = "moderate"
        else:
            risk_tier = "safe"

        predicted_pay_date = due_date + datetime.timedelta(days=max(0, expected_delay))

        return DelayPrediction(
            invoice_id=invoice_id,
            expected_delay_days=expected_delay,
            predicted_pay_date=predicted_pay_date,
            payment_reliability_score=base_score,
            risk_tier=risk_tier,
            confidence_score=0.82,
        )


delay_predictor = BaselineDelayPredictor()
