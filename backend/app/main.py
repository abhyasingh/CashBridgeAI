"""CashBridge AI — FastAPI Backend Application Entry Point.

Predicts cash-flow shortfalls for Indian MSMEs weeks in advance and provides
one-tap invoice-linked liquidity bridging.
"""
from __future__ import annotations

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    alerts,
    assistant,
    business,
    connect,
    forecast,
    health,
    loan,
    receivables,
)
from app.config import ADDITIONAL_CORS_ORIGINS, API_V1_PREFIX, VITE_CORS_ORIGIN

app = FastAPI(
    title="CashBridge AI API",
    description="Indian MSME cash-flow prediction and invoice-linked micro-loan bridging platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for Vite frontend
origins = list(set([VITE_CORS_ORIGIN] + ADDITIONAL_CORS_ORIGINS + ["http://127.0.0.1:5173", "http://127.0.0.1:5174"]))
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 Router
v1_router = APIRouter(prefix=API_V1_PREFIX)
v1_router.include_router(health.router)
v1_router.include_router(connect.router)
v1_router.include_router(business.router)
v1_router.include_router(forecast.router)
v1_router.include_router(alerts.router)
v1_router.include_router(receivables.router)
v1_router.include_router(loan.router)
v1_router.include_router(assistant.router)

app.include_router(v1_router)

# Also include root-level convenience endpoints for frontend clients calling unversioned endpoints
app.include_router(health.router)
app.include_router(business.router)
app.include_router(forecast.router)
app.include_router(alerts.router)
app.include_router(receivables.router)
app.include_router(loan.router)
app.include_router(assistant.router)
app.include_router(connect.router)


@app.get("/")
def root():
    return {
        "service": "CashBridge AI Core API",
        "version": "1.0.0",
        "docs": "/docs",
        "snapshot_date": "2026-10-25",
        "demo_business": "Sharma Garments, Lucknow (MSME0002)",
    }
