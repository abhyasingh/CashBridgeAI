"""
Seed script: Populates SQLite database from /backend/data/processed/
Ensures tables exist, populates Businesses, Customers, Invoices, Expenses, Bank Transactions,
and handles demo business alias 'Sharma Garments, Lucknow' (MSME0002).
"""
import datetime
import sys
from pathlib import Path

import pandas as pd

# Ensure backend directory is in python path
backend_dir = Path(__file__).parents[1]
sys.path.insert(0, str(backend_dir))

from app.db.session import Base, SessionLocal, engine
from app.models.orm import AuditLog, BankTxn, Business, Customer, Expense, Invoice

PROCESSED_DIR = backend_dir / "data" / "processed"

def seed():
    print("Dropping existing tables and creating fresh schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Businesses
        print("Seeding businesses...")
        biz_df = pd.read_csv(PROCESSED_DIR / "businesses.csv")
        biz_records = []
        for _, row in biz_df.iterrows():
            display_name = str(row["display_name"]) if pd.notna(row["display_name"]) else str(row["business_name"])
            if row["msme_id"] == "MSME0002":
                display_name = "Sharma Garments, Lucknow"
                
            biz = Business(
                id=str(row["msme_id"]),
                name=str(row["business_name"]),
                display_name=display_name,
                sector=str(row["sector"]),
                size_class=str(row["size_class"]),
                state=str(row["state"]),
                district=str(row["district"]),
                city=str(row["district"]),
                annual_turnover_inr=float(row["annual_turnover_inr"]) if pd.notna(row["annual_turnover_inr"]) else 0.0,
                employees=int(row["employees"]) if pd.notna(row["employees"]) else 1,
                vintage_years=float(row["vintage_years"]) if pd.notna(row["vintage_years"]) else 0.0,
                accounting_software=str(row["accounting_software"]) if pd.notna(row["accounting_software"]) else "Tally",
                gst_registered=bool(row["gst_registered"] == "Yes" or row["gst_registered"] is True),
                has_existing_term_loan=bool(row["has_existing_term_loan"] == "Yes" or row["has_existing_term_loan"] is True),
                monthly_emi_inr=float(row["monthly_emi_inr"]) if pd.notna(row["monthly_emi_inr"]) else 0.0,
                min_cash_buffer_inr=float(row["min_cash_buffer_inr"]) if pd.notna(row["min_cash_buffer_inr"]) else 0.0,
                opening_balance_inr=float(row["opening_balance_inr"]) if pd.notna(row["opening_balance_inr"]) else 0.0,
                avg_weekly_operating_outflow_inr=float(row["avg_weekly_operating_outflow_inr"]) if pd.notna(row["avg_weekly_operating_outflow_inr"]) else 0.0,
                n_customers=int(row["n_customers"]) if pd.notna(row["n_customers"]) else 0,
                top_customer_share=float(row["top_customer_share"]) if pd.notna(row["top_customer_share"]) else 0.0,
                preferred_language=str(row["preferred_language"]) if pd.notna(row["preferred_language"]) else "en",
                alert_channel=str(row["alert_channel"]) if pd.notna(row["alert_channel"]) else "App",
                cashbridge_credit_score=float(row["cashbridge_credit_score"]) if pd.notna(row["cashbridge_credit_score"]) else None,
                risk_band=str(row["risk_band"]) if pd.notna(row["risk_band"]) else "B",
                credit_limit_inr=float(row["credit_limit_inr"]) if pd.notna(row["credit_limit_inr"]) else None,
                historical_on_time_payment_rate=float(row["historical_on_time_payment_rate"]) if pd.notna(row["historical_on_time_payment_rate"]) else None,
                demo_showcase=bool(row["demo_showcase"] == 1),
                demo_persona=str(row["demo_persona"]) if pd.notna(row["demo_persona"]) else None,
            )
            biz_records.append(biz)
        db.bulk_save_objects(biz_records)
        db.commit()
        print(f"  -> {len(biz_records)} businesses seeded.")

        # 2. Customers
        print("Seeding customers...")
        cust_df = pd.read_csv(PROCESSED_DIR / "customers.csv")
        cust_records = []
        for _, row in cust_df.iterrows():
            cust = Customer(
                id=str(row["id"]),
                business_id=str(row["business_id"]),
                name=str(row["name"]),
                segment=str(row["segment"]) if pd.notna(row["segment"]) else "Other MSME",
                avg_prior_delay_days=float(row["avg_prior_delay_days"]) if pd.notna(row["avg_prior_delay_days"]) else None,
                prior_late_rate=float(row["prior_late_rate"]) if pd.notna(row["prior_late_rate"]) else None,
                prior_invoice_count=int(row["prior_invoice_count"]) if pd.notna(row["prior_invoice_count"]) else 0,
            )
            cust_records.append(cust)
        db.bulk_save_objects(cust_records)
        db.commit()
        print(f"  -> {len(cust_records)} customers seeded.")

        # 3. Invoices
        print("Seeding invoices...")
        inv_df = pd.read_csv(PROCESSED_DIR / "invoices.csv")
        inv_records = []
        for _, row in inv_df.iterrows():
            issue_d = datetime.date.fromisoformat(row["issue_date"])
            due_d = datetime.date.fromisoformat(row["due_date"])
            paid_d = datetime.date.fromisoformat(row["paid_date"]) if pd.notna(row["paid_date"]) and row["paid_date"] else None
            
            # Compute predicted pay date for open invoices
            prior_delay = float(row["customer_avg_prior_delay_days"]) if pd.notna(row["customer_avg_prior_delay_days"]) else 14.0
            predicted_delay = max(0, int(round(prior_delay)))
            predicted_pay = due_d + datetime.timedelta(days=predicted_delay)

            inv = Invoice(
                id=str(row["id"]),
                business_id=str(row["business_id"]),
                customer_id=str(row["customer_id"]) if pd.notna(row["customer_id"]) else None,
                customer_name=str(row["customer_name"]),
                customer_type=str(row["customer_type"]) if pd.notna(row["customer_type"]) else None,
                issue_date=issue_d,
                payment_terms_days=int(row["payment_terms_days"]) if pd.notna(row["payment_terms_days"]) else 30,
                due_date=due_d,
                amount_excl_gst=float(row["amount_excl_gst"]) if pd.notna(row["amount_excl_gst"]) else 0.0,
                gst_amount=float(row["gst_amount"]) if pd.notna(row["gst_amount"]) else 0.0,
                amount=float(row["amount"]),
                status=str(row["status"]),
                paid_date=paid_d,
                delay_days=float(row["delay_days"]) if pd.notna(row["delay_days"]) else None,
                is_late=bool(row["is_late"] == 1 or row["is_late"] is True) if pd.notna(row["is_late"]) else None,
                days_overdue_at_snapshot=float(row["days_overdue_at_snapshot"]) if pd.notna(row["days_overdue_at_snapshot"]) else None,
                customer_avg_prior_delay_days=float(row["customer_avg_prior_delay_days"]) if pd.notna(row["customer_avg_prior_delay_days"]) else None,
                customer_prior_late_rate=float(row["customer_prior_late_rate"]) if pd.notna(row["customer_prior_late_rate"]) else None,
                predicted_pay_date=predicted_pay,
                predicted_delay_days=float(predicted_delay),
            )
            inv_records.append(inv)
        db.bulk_save_objects(inv_records)
        db.commit()
        print(f"  -> {len(inv_records)} invoices seeded.")

        # 4. Expenses (Sample / batch insert to keep speed optimal)
        print("Seeding expenses...")
        exp_df = pd.read_csv(PROCESSED_DIR / "expenses.csv")
        exp_records = []
        for _, row in exp_df.iterrows():
            exp = Expense(
                business_id=str(row["business_id"]),
                date=datetime.date.fromisoformat(row["date"]),
                category=str(row["category"]),
                amount=float(row["amount"]),
                recurring=bool(row["recurring"]),
            )
            exp_records.append(exp)
        db.bulk_save_objects(exp_records)
        db.commit()
        print(f"  -> {len(exp_records)} expenses seeded.")

        # 5. Bank Transactions (batch insert)
        print("Seeding bank transactions...")
        btx_df = pd.read_csv(PROCESSED_DIR / "bank_txns.csv")
        btx_records = []
        for _, row in btx_df.iterrows():
            btx = BankTxn(
                id=str(row["id"]),
                business_id=str(row["business_id"]),
                date=datetime.date.fromisoformat(row["date"]),
                direction=str(row["direction"]),
                category=str(row["category"]),
                counterparty=str(row["counterparty"]) if pd.notna(row["counterparty"]) else None,
                amount=float(row["amount"]),
                payment_mode=str(row["payment_mode"]) if pd.notna(row["payment_mode"]) else None,
                linked_invoice_id=str(row["linked_invoice_id"]) if pd.notna(row["linked_invoice_id"]) else None,
                balance_after=float(row["balance_after"]) if pd.notna(row["balance_after"]) else 0.0,
            )
            btx_records.append(btx)
        db.bulk_save_objects(btx_records)
        db.commit()
        print(f"  -> {len(btx_records)} bank transactions seeded.")

        # Audit log entry
        audit = AuditLog(
            business_id="MSME0002",
            action="DATABASE_SEEDED",
            detail=f"Seeded {len(biz_records)} businesses, {len(inv_records)} invoices, {len(btx_records)} bank txns.",
        )
        db.add(audit)
        db.commit()
        print("Seed completed successfully! Database ready at:", engine.url)
        
    except Exception as e:
        db.rollback()
        print("ERROR during seeding:", e)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
