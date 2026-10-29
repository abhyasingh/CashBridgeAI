"""
Phase 0 & 1 Data Cleaning Script
Transforms raw dataset files into canonical schemas and outputs them to /backend/data/processed/
Never modifies raw files.
"""
from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).parents[1] / "data" / "raw"
PROCESSED_DIR = Path(__file__).parents[1] / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

def clean_data():
    print("Starting data transformation to canonical schema...")
    
    # 1. Businesses
    print("Processing businesses...")
    profiles_df = pd.read_csv(RAW_DIR / "msme_profiles.csv")
    profiles_df["display_name"] = profiles_df["business_name"]
    # Apply display alias for MSME0002
    profiles_df.loc[profiles_df["msme_id"] == "MSME0002", "display_name"] = "Sharma Garments, Lucknow"
    profiles_df.to_csv(PROCESSED_DIR / "businesses.csv", index=False)
    print(f"  -> {len(profiles_df)} businesses saved.")

    # 2. Customers
    print("Processing customers...")
    inv_df = pd.read_csv(RAW_DIR / "invoices.csv")
    customers = (
        inv_df.groupby(["customer_id", "msme_id"])
        .agg({
            "customer_name": "last",
            "customer_type": "last",
            "customer_avg_prior_delay_days": "mean",
            "customer_prior_late_rate": "mean",
            "invoice_id": "count"
        })
        .reset_index()
        .rename(columns={
            "customer_id": "id",
            "msme_id": "business_id",
            "customer_name": "name",
            "customer_type": "segment",
            "customer_avg_prior_delay_days": "avg_prior_delay_days",
            "customer_prior_late_rate": "prior_late_rate",
            "invoice_id": "prior_invoice_count"
        })
    )
    customers.to_csv(PROCESSED_DIR / "customers.csv", index=False)
    print(f"  -> {len(customers)} unique customers saved.")

    # 3. Invoices
    print("Processing invoices...")
    invoices = inv_df.rename(columns={
        "invoice_id": "id",
        "msme_id": "business_id",
        "invoice_date": "issue_date",
        "invoice_amount_inr": "amount",
        "status_at_snapshot": "status",
        "amount_excl_gst_inr": "amount_excl_gst",
        "gst_amount_inr": "gst_amount"
    })
    invoices.to_csv(PROCESSED_DIR / "invoices.csv", index=False)
    print(f"  -> {len(invoices)} invoices saved.")

    # 4. Bank Transactions
    print("Processing bank transactions...")
    btx_df = pd.read_csv(RAW_DIR / "bank_transactions.csv")
    bank_txns = btx_df.rename(columns={
        "txn_id": "id",
        "msme_id": "business_id",
        "txn_date": "date",
        "amount_inr": "amount",
        "day_end_balance_inr": "balance_after"
    })
    bank_txns.to_csv(PROCESSED_DIR / "bank_txns.csv", index=False)
    print(f"  -> {len(bank_txns)} bank transactions saved.")

    # 5. Expenses
    print("Processing expenses...")
    debits = btx_df[btx_df["direction"] == "Debit"].copy()
    recurring_categories = {"Salaries", "Rent", "Utilities", "GST payment", "Loan EMI"}
    debits["recurring"] = debits["category"].isin(recurring_categories)
    expenses = debits.rename(columns={
        "txn_id": "id",
        "msme_id": "business_id",
        "txn_date": "date",
        "amount_inr": "amount"
    })[["id", "business_id", "date", "category", "amount", "recurring"]]
    expenses.to_csv(PROCESSED_DIR / "expenses.csv", index=False)
    print(f"  -> {len(expenses)} expenses saved.")

    # 6. Recurring Commitments
    print("Processing recurring commitments...")
    rc_df = pd.read_csv(RAW_DIR / "recurring_commitments.csv")
    rc_df.to_csv(PROCESSED_DIR / "recurring_commitments.csv", index=False)
    print(f"  -> {len(rc_df)} commitments saved.")

    # 7. Bridge Loan Offers
    print("Processing bridge loan offers...")
    blo_df = pd.read_csv(RAW_DIR / "bridge_loan_offers.csv")
    blo_df.to_csv(PROCESSED_DIR / "bridge_loan_offers.csv", index=False)
    print(f"  -> {len(blo_df)} loan offers saved.")

    print("All processed datasets written successfully to", PROCESSED_DIR)

if __name__ == "__main__":
    clean_data()
