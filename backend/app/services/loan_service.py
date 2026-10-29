"""Loan Service: sizes micro-credit bridge offers to projected shortfall and handles one-tap simulated disbursal."""
from __future__ import annotations

import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import (
    LOAN_AMOUNT_ROUND_UP,
    LOAN_APR_BY_BAND,
    LOAN_BUFFER_MULTIPLIER,
    LOAN_MIN_TENURE_DAYS,
    LOAN_PROCESSING_FEE_PCT,
)
from app.models.orm import AuditLog, Business, Invoice, Loan
from app.schemas.api_schemas import (
    KeyFactItem,
    LoanAcceptRequest,
    LoanAcceptResponse,
    LoanOffer,
    LoanOfferRequest,
)
from app.services.business_service import BusinessService

SNAPSHOT_DATE = datetime.date(2026, 10, 25)


class LoanService:
    @classmethod
    def get_offer(cls, db: Session, request: LoanOfferRequest) -> LoanOffer:
        canonical_id = BusinessService.resolve_business_id(request.businessId)
        biz = db.execute(select(Business).where(Business.id == canonical_id)).scalar_one_or_none()
        if not biz:
            biz = db.execute(select(Business).where(Business.id == "MSME0002")).scalar_one()

        shortfall = request.customAmount if request.customAmount else 210000.0
        
        # Rule: amount = shortfall x 1.1 rounded up to Rs 5,000
        raw_sanctioned = shortfall * LOAN_BUFFER_MULTIPLIER
        sanctioned_amount = float(int((raw_sanctioned + LOAN_AMOUNT_ROUND_UP - 1) // LOAN_AMOUNT_ROUND_UP) * LOAN_AMOUNT_ROUND_UP)

        # Tenure: 21 days default
        tenure_days = LOAN_MIN_TENURE_DAYS

        # Pricing based on business risk band
        risk_band = biz.risk_band or "B"
        apr_annual = LOAN_APR_BY_BAND.get(risk_band, 20.0)
        # Flat period interest for tenure
        interest_flat_pct = round((apr_annual / 365.0) * tenure_days, 2)
        interest_amount = round(sanctioned_amount * (interest_flat_pct / 100.0))
        
        # Processing fee + GST
        fee_pct = LOAN_PROCESSING_FEE_PCT
        processing_fee = round(sanctioned_amount * (fee_pct / 100.0))
        gst_on_fee = round(processing_fee * 0.18)
        net_disbursal = round(sanctioned_amount - (processing_fee + gst_on_fee))
        total_repayable = round(sanctioned_amount + interest_amount)

        # Linked invoice
        linked_inv = db.execute(
            select(Invoice).where(
                Invoice.business_id == canonical_id,
                Invoice.status.like("Open%")
            ).order_by(Invoice.amount.desc())
        ).scalars().first()

        linked_inv_num = linked_inv.id if linked_inv else "INV-2026-089"
        linked_cust_name = linked_inv.customer_name if linked_inv else "Kapoor Retailers"
        linked_inv_amt = linked_inv.amount if linked_inv else 185000.0

        est_repay_date = (SNAPSHOT_DATE + datetime.timedelta(days=tenure_days)).strftime("%d %b %Y")

        key_facts = [
            KeyFactItem(
                labelEn="Sanctioned Micro-Credit",
                labelHi="स्वीकृत लोन राशि",
                valueEn=f"₹{sanctioned_amount:,.0f}",
                valueHi=f"₹{sanctioned_amount:,.0f}",
            ),
            KeyFactItem(
                labelEn="Bridge Tenure",
                labelHi="लोन अवधि",
                valueEn=f"{tenure_days} Days (Till Invoice Clears)",
                valueHi=f"{tenure_days} दिन (बिल भुगतान तक)",
            ),
            KeyFactItem(
                labelEn=f"Interest Rate ({apr_annual:.1f}% APR)",
                labelHi=f"ब्याज दर ({apr_annual:.1f}% APR)",
                valueEn=f"{interest_flat_pct:.2f}% flat (₹{interest_amount:,.0f})",
                valueHi=f"{interest_flat_pct:.2f}% कुल (₹{interest_amount:,.0f})",
            ),
            KeyFactItem(
                labelEn="Processing Fee + GST (18%)",
                labelHi="प्रोसेसिंग शुल्क + GST",
                valueEn=f"₹{processing_fee + gst_on_fee:,.0f} (Upfront deduction)",
                valueHi=f"₹{processing_fee + gst_on_fee:,.0f} (पहले काटा जाएगा)",
            ),
            KeyFactItem(
                labelEn="Net In Bank Account",
                labelHi="खाते में आने वाली राशि",
                valueEn=f"₹{net_disbursal:,.0f}",
                valueHi=f"₹{net_disbursal:,.0f}",
            ),
            KeyFactItem(
                labelEn="Total Repayment",
                labelHi="कुल चुकौती",
                valueEn=f"₹{total_repayable:,.0f}",
                valueHi=f"₹{total_repayable:,.0f}",
            ),
            KeyFactItem(
                labelEn="Automatic Settlement",
                labelHi="ऑटो-सेटलमेंट",
                valueEn=f"Auto-settled when {linked_cust_name} pays {linked_inv_num}",
                valueHi=f"{linked_cust_name} द्वारा बिल क्लियर होते ही स्वतः कट जाएगा",
            ),
        ]

        return LoanOffer(
            offerId=f"CB-LN-2026-{biz.id[-4:]}",
            lenderName="Shivalik Small Finance Bank (Demo Partner)",
            lenderType="RBI Licensed Small Finance Bank (Simulated)",
            rbiRegulated=True,
            sanctionedAmount=sanctioned_amount,
            tenureDays=tenure_days,
            interestRateFlatPercent=interest_flat_pct,
            interestAmount=interest_amount,
            processingFeePercent=fee_pct,
            processingFeeAmount=processing_fee,
            gstOnFee=gst_on_fee,
            netDisbursalAmount=net_disbursal,
            totalRepayableAmount=total_repayable,
            linkedInvoiceNumber=linked_inv_num,
            linkedCustomerName=linked_cust_name,
            linkedInvoiceAmount=linked_inv_amt,
            autoRepayMechanism="Auto-debit triggered upon invoice realization in HDFC current account",
            estimatedRepaymentDate=est_repay_date,
            keyFactsStatement=key_facts,
            isSimulated=True,
        )

    @classmethod
    def accept_loan(cls, db: Session, request: LoanAcceptRequest) -> LoanAcceptResponse:
        canonical_id = BusinessService.resolve_business_id(request.businessId)
        
        if not request.consentAgreed:
            raise ValueError("Customer consent checkbox must be agreed before disbursal.")

        # Compute loan numbers
        offer = cls.get_offer(db, LoanOfferRequest(businessId=canonical_id))
        loan_id = f"LN-DISB-2026-{datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')}"

        # Persist Loan record
        loan = Loan(
            id=loan_id,
            business_id=canonical_id,
            alert_id="alt_gap_01",
            linked_invoice_id=request.linkedInvoiceNumber,
            offer_amount=offer.sanctionedAmount,
            disbursed_amount=offer.netDisbursalAmount,
            tenure_days=offer.tenureDays,
            apr_pct=20.0,
            processing_fee_pct=offer.processingFeePercent,
            interest_charged=offer.interestAmount,
            total_repayable=offer.totalRepayableAmount,
            lender_name=offer.lenderName,
            status="ACTIVE",
            consent_given=True,
            repaid_at=None,
        )
        db.add(loan)

        # Audit log entry for digital lending compliance
        audit = AuditLog(
            business_id=canonical_id,
            action="LOAN_DISBURSED_DEMO",
            detail=f"Disbursed loan {loan_id} for ₹{offer.sanctionedAmount:,.0f}. Consent recorded: {request.consentAgreed}. Linked invoice: {request.linkedInvoiceNumber}",
        )
        db.add(audit)
        db.commit()

        repayment_due = (SNAPSHOT_DATE + datetime.timedelta(days=offer.tenureDays)).strftime("%d %b %Y")

        return LoanAcceptResponse(
            loanId=loan_id,
            disbursedAmount=offer.netDisbursalAmount,
            disbursalTimestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            targetAccountMasked="HDFC Bank •••• 4912",
            status="DISBURSED",
            repaymentDueDate=repayment_due,
            linkedInvoiceNumber=request.linkedInvoiceNumber,
        )


loan_service = LoanService()
