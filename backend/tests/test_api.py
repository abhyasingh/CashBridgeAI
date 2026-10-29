"""Pytest test suite covering routes, loan math, CSV validation, and Tally XML parsing."""
from fastapi.testclient import TestClient

from app.connectors.csv_connector import csv_connector
from app.connectors.tally_connector import tally_connector
from app.db.session import SessionLocal
from app.main import app
from app.schemas.api_schemas import LoanOfferRequest
from app.services.loan_service import loan_service

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. API Route Tests
# ---------------------------------------------------------------------------
def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["data"]["service"] == "CashBridge AI Core API"


def test_business_profile():
    res = client.get("/business/profile")
    assert res.status_code == 200
    data = res.json()["data"]
    assert "Sharma Garments" in data["name"]
    assert data["bankAccount"]["currentBalance"] > 0
    assert data["bankAccount"]["safeBufferThreshold"] > 0
    assert len(data["connectedSources"]) >= 2


def test_business_summary():
    res = client.get("/business/summary")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["runwayDays"] > 0
    assert data["expectedInflow7Days"] > 0
    assert data["outflowDue15Days"] > 0
    assert data["riskLevel"] in ("CRITICAL_SHORTFALL", "MODERATE_RISK", "SAFE")


def test_forecast_endpoint():
    res = client.get("/forecast")
    assert res.status_code == 200
    points = res.json()["data"]
    assert len(points) >= 30
    first = points[0]
    assert first["label"] == "Today"
    assert first["p50"] > 0
    assert first["buffer"] > 0


def test_gap_alerts_and_explain():
    res = client.get("/alerts")
    assert res.status_code == 200
    alerts = res.json()["data"]
    assert len(alerts) >= 1
    assert alerts[0]["shortfallAmount"] == 210000.0

    # Test explanation in English
    res_en = client.get("/alerts/alt_gap_01/explain?lang=en")
    assert res_en.status_code == 200
    data_en = res_en.json()["data"]
    assert data_en["shortfallAmount"] == 210000.0
    assert len(data_en["factors"]) == 3

    # Test explanation in Hindi
    res_hi = client.get("/alerts/alt_gap_01/explain?lang=hi")
    assert res_hi.status_code == 200
    data_hi = res_hi.json()["data"]
    assert "18वें दिन" in data_hi["summaryHi"]


def test_receivables_endpoint():
    res = client.get("/receivables")
    assert res.status_code == 200
    invoices = res.json()["data"]
    assert len(invoices) >= 5
    first = invoices[0]
    assert "amount" in first
    assert "predictedPayDate" in first
    assert "riskTier" in first


# ---------------------------------------------------------------------------
# 2. Loan Math & Disbursal Tests
# ---------------------------------------------------------------------------
def test_loan_sizing_math():
    db = SessionLocal()
    try:
        # Shortfall = 210,000 -> x 1.1 = 231,000 -> round up to 5,000 = 235,000
        offer = loan_service.get_offer(db, LoanOfferRequest(businessId="MSME0002", customAmount=210000.0))
        assert offer.sanctionedAmount == 235000.0
        assert offer.tenureDays >= 21
        assert offer.processingFeePercent == 1.5
        # Fee = 235,000 * 1.5% = 3,525; GST 18% = 635; Net = 235,000 - 4,160 = 230,840
        assert offer.processingFeeAmount == round(235000 * 0.015)
        assert offer.netDisbursalAmount < offer.sanctionedAmount
        assert offer.totalRepayableAmount > offer.sanctionedAmount
        assert "Simulated" in offer.lenderType
        assert len(offer.keyFactsStatement) == 7
    finally:
        db.close()


def test_loan_accept_requires_consent():
    res = client.post("/loan/accept", json={
        "offerId": "CB-001",
        "consentAgreed": False,
        "linkedInvoiceNumber": "INV-089",
        "businessId": "MSME0002"
    })
    assert res.status_code == 400
    assert "consent" in res.json()["detail"].lower()


def test_loan_accept_success():
    res = client.post("/loan/accept", json={
        "offerId": "CB-001",
        "consentAgreed": True,
        "linkedInvoiceNumber": "INV-2026-089",
        "businessId": "MSME0002"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["status"] == "DISBURSED"
    assert "LN-DISB" in data["loanId"]
    assert data["disbursedAmount"] > 0


# ---------------------------------------------------------------------------
# 3. CSV Validation Tests
# ---------------------------------------------------------------------------
def test_csv_validation_valid_invoices():
    csv_data = b"invoice_number,customer_name,amount,due_date\nINV-001,ABC Corp,50000,2026-11-15\nINV-002,XYZ Ltd,75000,2026-11-20\n"
    res = csv_connector.validate_and_parse_csv(csv_data, "invoices.csv")
    assert res["status"] == "valid"
    assert res["records_imported"] == 2
    assert res["type"] == "invoices"


def test_csv_validation_bank_statement():
    csv_data = b"date,amount,direction,txn_id\n2026-10-20,15000,Credit,TXN01\n2026-10-21,5000,Debit,TXN02\n"
    res = csv_connector.validate_and_parse_csv(csv_data, "bank.csv")
    assert res["status"] == "valid"
    assert res["records_imported"] == 2
    assert res["type"] == "bank_statement"


# ---------------------------------------------------------------------------
# 4. Tally XML Parsing Tests
# ---------------------------------------------------------------------------
def test_tally_xml_parsing():
    sample_xml = """<ENVELOPE>
      <BODY>
        <DATA>
          <TALLYMESSAGE>
            <VOUCHER VCHTYPE="Sales">
              <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
              <DATE>20261020</DATE>
              <VOUCHERNUMBER>INV-TALLY-101</VOUCHERNUMBER>
              <PARTYLEDGERNAME>Kapoor Retailers</PARTYLEDGERNAME>
              <ALLLEDGERENTRIES.LIST>
                <LEDGERNAME>Sales Account</LEDGERNAME>
                <AMOUNT>-185000.00</AMOUNT>
              </ALLLEDGERENTRIES.LIST>
            </VOUCHER>
          </TALLYMESSAGE>
        </DATA>
      </BODY>
    </ENVELOPE>"""
    res = tally_connector.parse_tally_xml(sample_xml)
    assert res["status"] == "success"
    assert res["vouchers_found"] == 1
    v = res["vouchers"][0]
    assert v["voucher_number"] == "INV-TALLY-101"
    assert v["party_name"] == "Kapoor Retailers"
    assert v["amount"] == 185000.0


# ---------------------------------------------------------------------------
# 5. Assistant Tests (Bilingual Intent Routing)
# ---------------------------------------------------------------------------
def test_assistant_bilingual():
    # English query
    res_en = client.post("/assistant/ask", json={
        "question": "What is my current cash runway and balance?",
        "language": "en"
    })
    assert res_en.status_code == 200
    assert "runway" in res_en.json()["data"]["answer"].lower()

    # Hindi query
    res_hi = client.post("/assistant/ask", json={
        "question": "कमी का मुख्य कारण क्या है?",
        "language": "hi"
    })
    assert res_hi.status_code == 200
    assert "कमी" in res_hi.json()["data"]["answer"]
