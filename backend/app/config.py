"""Application configuration using pydantic-settings pattern with python-dotenv."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend directory
_backend_dir = Path(__file__).parents[1]
load_dotenv(_backend_dir / ".env")

# ---------------------------------------------------------------------------
# Core settings (read from environment; fallback defaults are dev-safe)
# ---------------------------------------------------------------------------
DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_backend_dir / 'data' / 'cashbridge_dev.db'}")
DATA_DIR: Path = Path(os.getenv("DATA_DIR", str(_backend_dir.parent / "data")))
PROCESSED_DIR: Path = _backend_dir / "data" / "processed"
VITE_CORS_ORIGIN: str = os.getenv("VITE_CORS_ORIGIN", "http://localhost:5173")
ADDITIONAL_CORS_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
]

# Telegram bot
TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

# LLM / assistant (optional)
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
USE_LLM_ASSISTANT: bool = os.getenv("USE_LLM_ASSISTANT", "false").lower() == "true"

# Demo snapshot date – never use Date.now() for the demo
SNAPSHOT_DATE: str = "2026-10-25"

# Logging
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

# API
API_V1_PREFIX: str = "/api/v1"

# Loan pricing by risk band (APR %)
LOAN_APR_BY_BAND: dict[str, float] = {"A": 16.0, "B": 20.0, "C": 26.0, "D": 32.0}
LOAN_PROCESSING_FEE_PCT: float = 1.5
LOAN_MIN_TENURE_DAYS: int = 21
LOAN_AMOUNT_ROUND_UP: int = 5_000
LOAN_BUFFER_MULTIPLIER: float = 1.10  # size loan at 110% of shortfall
