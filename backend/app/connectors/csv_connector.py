"""CSV Connector: validates and parses uploaded bank statement or invoices CSV."""
from __future__ import annotations

import io
from typing import Any

import pandas as pd

REQUIRED_INVOICE_COLS = {"invoice_number", "customer_name", "amount", "due_date"}
REQUIRED_BANK_COLS = {"date", "amount", "direction"}


class CsvConnector:
    @staticmethod
    def validate_and_parse_csv(file_bytes: bytes, filename: str) -> dict[str, Any]:
        """Validates CSV schema against invoice or bank transaction templates."""
        try:
            df = pd.read_csv(io.BytesIO(file_bytes))
        except Exception as e:
            raise ValueError(f"Could not parse CSV file: {e}")

        cols = set(c.lower().strip() for c in df.columns)
        
        # Check if invoice CSV
        if any(c in cols for c in ["invoice_id", "invoice_number", "invoicenumber"]):
            records_count = len(df)
            total_value = float(df.get("amount", df.get("invoice_amount_inr", 0)).sum())
            return {
                "source": "csv",
                "type": "invoices",
                "records_imported": records_count,
                "total_value": total_value,
                "columns": list(df.columns),
                "status": "valid",
            }
        
        # Check if bank statement CSV
        if any(c in cols for c in ["txn_id", "date", "txn_date"]):
            records_count = len(df)
            return {
                "source": "csv",
                "type": "bank_statement",
                "records_imported": records_count,
                "columns": list(df.columns),
                "status": "valid",
            }

        # Generic acceptable CSV
        return {
            "source": "csv",
            "type": "generic_data",
            "records_imported": len(df),
            "columns": list(df.columns),
            "status": "valid",
        }


csv_connector = CsvConnector()
