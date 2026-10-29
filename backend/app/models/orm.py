"""SQLAlchemy ORM models — the canonical DB schema for CashBridge AI."""
from __future__ import annotations

import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)  # MSME0001
    name: Mapped[str] = mapped_column(String(200))
    display_name: Mapped[Optional[str]] = mapped_column(String(200))  # alias override
    sector: Mapped[str] = mapped_column(String(100))
    size_class: Mapped[str] = mapped_column(String(20))
    state: Mapped[str] = mapped_column(String(100))
    district: Mapped[str] = mapped_column(String(100))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    annual_turnover_inr: Mapped[float] = mapped_column(Float, default=0)
    employees: Mapped[int] = mapped_column(Integer, default=1)
    vintage_years: Mapped[float] = mapped_column(Float, default=0)
    accounting_software: Mapped[Optional[str]] = mapped_column(String(50))
    gst_registered: Mapped[bool] = mapped_column(Boolean, default=True)
    has_existing_term_loan: Mapped[bool] = mapped_column(Boolean, default=False)
    monthly_emi_inr: Mapped[float] = mapped_column(Float, default=0)
    min_cash_buffer_inr: Mapped[float] = mapped_column(Float, default=0)
    opening_balance_inr: Mapped[float] = mapped_column(Float, default=0)
    avg_weekly_operating_outflow_inr: Mapped[float] = mapped_column(Float, default=0)
    n_customers: Mapped[int] = mapped_column(Integer, default=0)
    top_customer_share: Mapped[float] = mapped_column(Float, default=0)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    alert_channel: Mapped[Optional[str]] = mapped_column(String(50))
    cashbridge_credit_score: Mapped[Optional[float]] = mapped_column(Float)
    risk_band: Mapped[Optional[str]] = mapped_column(String(5))
    credit_limit_inr: Mapped[Optional[float]] = mapped_column(Float)
    historical_on_time_payment_rate: Mapped[Optional[float]] = mapped_column(Float)
    demo_showcase: Mapped[bool] = mapped_column(Boolean, default=False)
    demo_persona: Mapped[Optional[str]] = mapped_column(Text)

    customers: Mapped[list["Customer"]] = relationship(back_populates="business", cascade="all, delete-orphan")
    invoices: Mapped[list["Invoice"]] = relationship(back_populates="business", cascade="all, delete-orphan")
    expenses: Mapped[list["Expense"]] = relationship(back_populates="business", cascade="all, delete-orphan")
    bank_txns: Mapped[list["BankTxn"]] = relationship(back_populates="business", cascade="all, delete-orphan")
    loans: Mapped[list["Loan"]] = relationship(back_populates="business", cascade="all, delete-orphan")


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    business_id: Mapped[str] = mapped_column(ForeignKey("businesses.id"))
    name: Mapped[str] = mapped_column(String(200))
    segment: Mapped[Optional[str]] = mapped_column(String(100))  # customer_type
    avg_prior_delay_days: Mapped[Optional[float]] = mapped_column(Float)
    prior_late_rate: Mapped[Optional[float]] = mapped_column(Float)
    prior_invoice_count: Mapped[int] = mapped_column(Integer, default=0)

    business: Mapped["Business"] = relationship(back_populates="customers")
    invoices: Mapped[list["Invoice"]] = relationship(back_populates="customer")


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    business_id: Mapped[str] = mapped_column(ForeignKey("businesses.id"))
    customer_id: Mapped[Optional[str]] = mapped_column(ForeignKey("customers.id"))
    customer_name: Mapped[str] = mapped_column(String(200))
    customer_type: Mapped[Optional[str]] = mapped_column(String(100))
    issue_date: Mapped[datetime.date] = mapped_column(DateTime)
    payment_terms_days: Mapped[int] = mapped_column(Integer, default=30)
    due_date: Mapped[datetime.date] = mapped_column(DateTime)
    amount_excl_gst: Mapped[float] = mapped_column(Float, default=0)
    gst_amount: Mapped[float] = mapped_column(Float, default=0)
    amount: Mapped[float] = mapped_column(Float)  # total payable incl GST
    status: Mapped[str] = mapped_column(String(50))  # 'Open - Overdue', 'Open - Not yet due', 'Paid'
    paid_date: Mapped[Optional[datetime.date]] = mapped_column(DateTime)
    delay_days: Mapped[Optional[float]] = mapped_column(Float)
    is_late: Mapped[Optional[bool]] = mapped_column(Boolean)
    days_overdue_at_snapshot: Mapped[Optional[float]] = mapped_column(Float)
    customer_avg_prior_delay_days: Mapped[Optional[float]] = mapped_column(Float)
    customer_prior_late_rate: Mapped[Optional[float]] = mapped_column(Float)
    # Derived: predicted pay date (computed by forecast service)
    predicted_pay_date: Mapped[Optional[datetime.date]] = mapped_column(DateTime)
    predicted_delay_days: Mapped[Optional[float]] = mapped_column(Float)

    business: Mapped["Business"] = relationship(back_populates="invoices")
    customer: Mapped[Optional["Customer"]] = relationship(back_populates="invoices")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    business_id: Mapped[str] = mapped_column(ForeignKey("businesses.id"))
    date: Mapped[datetime.date] = mapped_column(DateTime)
    category: Mapped[str] = mapped_column(String(100))
    amount: Mapped[float] = mapped_column(Float)
    recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    frequency: Mapped[Optional[str]] = mapped_column(String(20))
    next_due_date: Mapped[Optional[datetime.date]] = mapped_column(DateTime)

    business: Mapped["Business"] = relationship(back_populates="expenses")


class BankTxn(Base):
    __tablename__ = "bank_txns"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    business_id: Mapped[str] = mapped_column(ForeignKey("businesses.id"))
    date: Mapped[datetime.date] = mapped_column(DateTime)
    direction: Mapped[str] = mapped_column(String(10))  # Credit / Debit
    category: Mapped[str] = mapped_column(String(100))
    counterparty: Mapped[Optional[str]] = mapped_column(String(200))
    amount: Mapped[float] = mapped_column(Float)
    payment_mode: Mapped[Optional[str]] = mapped_column(String(30))
    linked_invoice_id: Mapped[Optional[str]] = mapped_column(String(50))
    balance_after: Mapped[float] = mapped_column(Float, default=0)

    business: Mapped["Business"] = relationship(back_populates="bank_txns")


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    business_id: Mapped[str] = mapped_column(ForeignKey("businesses.id"))
    alert_id: Mapped[Optional[str]] = mapped_column(String(50))
    linked_invoice_id: Mapped[Optional[str]] = mapped_column(String(50))
    offer_amount: Mapped[float] = mapped_column(Float)
    disbursed_amount: Mapped[float] = mapped_column(Float)
    tenure_days: Mapped[int] = mapped_column(Integer)
    apr_pct: Mapped[float] = mapped_column(Float)
    processing_fee_pct: Mapped[float] = mapped_column(Float)
    interest_charged: Mapped[float] = mapped_column(Float)
    total_repayable: Mapped[float] = mapped_column(Float)
    lender_name: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")  # ACTIVE / REPAID / OVERDUE
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    repaid_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)

    business: Mapped["Business"] = relationship(back_populates="loans")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    business_id: Mapped[Optional[str]] = mapped_column(String(20))
    action: Mapped[str] = mapped_column(String(100))
    detail: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
