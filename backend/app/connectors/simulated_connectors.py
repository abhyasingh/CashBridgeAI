"""Simulated Connectors for QuickBooks and Account Aggregator (Bank Data).

Returns dataset-backed data, clearly marked as simulated.
"""
from __future__ import annotations

from typing import Any


class SimulatedConnectors:
    @staticmethod
    def connect_quickbooks(business_id: str) -> dict[str, Any]:
        return {
            "source": "quickbooks",
            "business_id": business_id,
            "status": "connected",
            "is_simulated": True,
            "message": "QuickBooks Online connected via simulated OAuth 2.0 handshake. Live sandbox data mapped.",
            "invoices_synced": 14,
            "customers_synced": 9,
        }

    @staticmethod
    def connect_bank_aa(business_id: str) -> dict[str, Any]:
        return {
            "source": "bank",
            "business_id": business_id,
            "status": "connected",
            "is_simulated": True,
            "message": "RBI Account Aggregator (HDFC Bank) consent artifact verified. 12-month statement synced.",
            "transactions_synced": 124,
            "verified_balance": 485000.0,
        }


simulated_connectors = SimulatedConnectors()
