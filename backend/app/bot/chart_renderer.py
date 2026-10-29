"""Renders a lightweight, high-contrast 13-week cashflow chart image for Telegram bot."""
from __future__ import annotations

import io

import matplotlib

matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import numpy as np


def render_forecast_chart_bytes(
    business_name: str,
    days: list[int],
    p50_values: list[float],
    p10_values: list[float],
    p90_values: list[float],
    buffer_threshold: float,
) -> bytes:
    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=150)
    fig.patch.set_facecolor("#F7F4EC")
    ax.set_facecolor("#FAF7F0")

    # Grid lines
    ax.grid(True, linestyle="--", alpha=0.5, color="#DCD2BD")

    # Minimum safe buffer line
    ax.axhline(
        y=buffer_threshold,
        color="#B83227",
        linestyle="--",
        linewidth=1.8,
        label=f"Safe Buffer (₹{buffer_threshold/100000:.1f}L)",
    )

    # Shaded confidence band (P10 to P90)
    ax.fill_between(
        days,
        p10_values,
        p90_values,
        color="#D9651C",
        alpha=0.15,
        label="80% Confidence Band (P10-P90)",
    )

    # Main P50 cash line
    ax.plot(
        days,
        p50_values,
        color="#111A24",
        linewidth=2.4,
        label="Expected Cash Flow (P50)",
        marker="o",
        markersize=3.5,
    )

    # Highlight shortfall dip
    min_idx = int(np.argmin(p50_values))
    min_day = days[min_idx]
    min_val = p50_values[min_idx]
    if min_val < buffer_threshold:
        gap = buffer_threshold - min_val
        ax.plot(min_day, min_val, "ro", markersize=8)
        ax.annotate(
            f"Day {min_day}: Deficit ₹{gap/100000:.1f}L",
            xy=(min_day, min_val),
            xytext=(min_day + 3, min_val - 25000),
            arrowprops=dict(facecolor="#B83227", shrink=0.05, width=1, headwidth=5),
            fontsize=9,
            fontweight="bold",
            color="#B83227",
        )

    ax.set_title(f"CashBridge AI: 13-Week Projection • {business_name}", fontsize=11, fontweight="bold", color="#111A24")
    ax.set_xlabel("Days Ahead", fontsize=9, color="#555555")
    ax.set_ylabel("Balance (INR)", fontsize=9, color="#555555")
    ax.legend(loc="upper right", fontsize=8, framealpha=0.85)

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()
