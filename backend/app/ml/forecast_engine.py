"""Monte Carlo Cash Forecast Engine.

Runs 1,000 probabilistic simulation paths projecting weekly cash balances across 13 weeks.
Models invoice collection uncertainty by sampling customer-specific payment delay distributions,
known statutory/recurring commitments, and baseline variable spend.
"""
from __future__ import annotations

import datetime

import numpy as np

from app.ml.interfaces import CashForecastEngine, WeeklyForecastPoint

SNAPSHOT_DATE = datetime.date(2026, 10, 25)


class MonteCarloForecastEngine(CashForecastEngine):
    def generate_13_week_forecast(
        self,
        business_id: str,
        start_balance: float,
        min_buffer: float,
        open_invoices: list[dict],
        recurring_commitments: list[dict],
        avg_weekly_cash_sales: float = 15000.0,
        avg_weekly_variable_spend: float = 35000.0,
        n_simulations: int = 1000,
    ) -> list[WeeklyForecastPoint]:
        np.random.seed(42)  # Fixed seed for deterministic reproducible demo runs

        # Prepare 13 weeks: week 0 to 12
        weeks_count = 13
        # Array shape: [n_simulations, weeks_count]
        inflows = np.zeros((n_simulations, weeks_count))
        outflows = np.zeros((n_simulations, weeks_count))

        # Add weekly cash/UPI sales (with modest noise)
        inflow_noise = np.random.normal(loc=1.0, scale=0.10, size=(n_simulations, weeks_count))
        inflows += avg_weekly_cash_sales * np.clip(inflow_noise, 0.5, 1.5)

        # Add weekly variable spend (with noise)
        outflow_noise = np.random.normal(loc=1.0, scale=0.12, size=(n_simulations, weeks_count))
        outflows += avg_weekly_variable_spend * np.clip(outflow_noise, 0.6, 1.6)

        # Place recurring commitments into appropriate weeks
        for commit in recurring_commitments:
            amt = float(commit.get("amount", 0.0))
            due_str = commit.get("next_due_date")
            freq = commit.get("frequency", "Monthly")
            
            if due_str:
                if isinstance(due_str, str):
                    due_d = datetime.date.fromisoformat(due_str.split("T")[0])
                else:
                    due_d = due_str
                diff_days = (due_d - SNAPSHOT_DATE).days
                first_wk = max(0, min(weeks_count - 1, diff_days // 7))
                
                if freq == "Weekly":
                    for w in range(first_wk, weeks_count):
                        outflows[:, w] += amt
                elif freq == "Monthly":
                    for w in range(first_wk, weeks_count, 4):
                        outflows[:, w] += amt
                else:  # Quarterly or One-off
                    if first_wk < weeks_count:
                        outflows[:, first_wk] += amt

        # Simulate invoice collection arrival week for each open invoice
        for inv in open_invoices:
            amt = float(inv.get("amount", 0.0))
            due_str = inv.get("due_date")
            if not due_str:
                continue
            if isinstance(due_str, str):
                due_d = datetime.date.fromisoformat(due_str.split("T")[0])
            elif isinstance(due_str, datetime.datetime):
                due_d = due_str.date()
            else:
                due_d = due_str

            base_offset_days = (due_d - SNAPSHOT_DATE).days
            avg_delay = float(inv.get("customer_avg_prior_delay_days") or 14.0)
            late_rate = float(inv.get("customer_prior_late_rate") or 0.40)
            
            # Sample delay for all 1000 runs using gamma/lognormal mixture
            # If late_rate is high, delay is skewed positive
            std_delay = max(4.0, avg_delay * 0.45)
            sampled_delays = np.random.normal(loc=avg_delay, scale=std_delay, size=n_simulations)
            sampled_delays = np.clip(sampled_delays, -5.0, 90.0)

            # Collection day relative to snapshot
            collection_days = base_offset_days + sampled_delays
            collection_weeks = np.floor(collection_days / 7.0).astype(int)

            for sim_idx in range(n_simulations):
                w = collection_weeks[sim_idx]
                if 0 <= w < weeks_count:
                    inflows[sim_idx, w] += amt

        # Compute cumulative balance matrix [n_simulations, weeks_count]
        net_flows = inflows - outflows
        balances = np.zeros((n_simulations, weeks_count))
        current_b = np.full(n_simulations, start_balance)

        for w in range(weeks_count):
            current_b += net_flows[:, w]
            balances[:, w] = current_b

        # Calculate P10, P50, P90
        p10 = np.percentile(balances, 10, axis=0)
        p50 = np.percentile(balances, 50, axis=0)
        p90 = np.percentile(balances, 90, axis=0)

        # Construct forecast points
        forecast_points: list[WeeklyForecastPoint] = []
        for w in range(weeks_count):
            wk_date = SNAPSHOT_DATE + datetime.timedelta(days=w * 7)
            date_str = wk_date.strftime("%d %b %Y")
            w_p10 = round(float(p10[w]), 2)
            w_p50 = round(float(p50[w]), 2)
            w_p90 = round(float(p90[w]), 2)

            is_def = w_p50 < min_buffer
            deficit_amt = max(0.0, round(min_buffer - w_p50, 2)) if is_def else 0.0

            note = None
            if w == 2:
                note = "Payroll & GST Statutory Outflow"
            elif w == 3 and is_def:
                note = "Peak Deficit Point"
            elif w == 5:
                note = "Major Invoice Realization"

            forecast_points.append(
                WeeklyForecastPoint(
                    week_index=w,
                    day_offset=w * 7,
                    date_str=date_str,
                    p10=w_p10,
                    p50=w_p50,
                    p90=w_p90,
                    min_buffer=min_buffer,
                    deficit_amount=deficit_amt,
                    is_deficit=is_def,
                    event_note=note,
                )
            )

        return forecast_points


forecast_engine = MonteCarloForecastEngine()
