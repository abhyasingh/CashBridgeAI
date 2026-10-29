"""Pydantic v2 Schemas for CashBridge AI API.

All response schemas are wrapped with ApiResponse[T] to guarantee 100% compatibility
with the frontend API client.
"""
from __future__ import annotations

import datetime
from typing import Generic, Literal, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    data: T
    status: Literal["success", "error"] = "success"
    message: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())


# ---------------------------------------------------------------------------
# Business & Summary Schemas
# ---------------------------------------------------------------------------
class ConnectedSource(BaseModel):
    id: str
    name: str
    type: Literal["accounting", "banking", "file"]
    status: Literal["connected", "disconnected", "syncing"]
    lastSync: str
    itemCount: int


class BankAccountInfo(BaseModel):
    bankName: str
    accountNumberMasked: str
    currentBalance: float
    safeBufferThreshold: float
    lastSyncedAt: str


class BusinessProfile(BaseModel):
    id: str
    name: str
    ownerName: str
    location: str
    category: str
    gstin: str
    bankAccount: BankAccountInfo
    connectedSources: list[ConnectedSource]


class BusinessSummary(BaseModel):
    businessId: str
    businessName: str
    currentBalance: float
    safeBufferThreshold: float
    expectedInflow7Days: float
    outflowDue15Days: float
    riskLevel: Literal["CRITICAL_SHORTFALL", "MODERATE_RISK", "SAFE"]
    runwayDays: int
    openInvoicesCount: int
    overdueInvoicesValue: float


# ---------------------------------------------------------------------------
# Forecast Schemas
# ---------------------------------------------------------------------------
class ForecastDataPoint(BaseModel):
    day: int
    week: int
    label: str
    dateStr: str
    p10: float
    p50: float
    p90: float
    buffer: float
    deficitAmount: float
    isDeficit: bool = False
    eventNote: Optional[str] = None


class LiveTickerItem(BaseModel):
    id: str
    severity: Literal["critical", "warning", "info"]
    messageEn: str
    messageHi: str
    timeLabel: str


# ---------------------------------------------------------------------------
# Alert & Explanation Schemas
# ---------------------------------------------------------------------------
class ShortfallFactor(BaseModel):
    id: str
    category: Literal["invoice_delay", "tax_statutory", "payroll", "supplier"]
    titleEn: str
    titleHi: str
    descriptionEn: str
    descriptionHi: str
    impactAmount: float
    percentageContribution: float
    severity: Literal["high", "medium", "low"]


class ShortfallAnalysis(BaseModel):
    shortfallDay: int
    shortfallDate: str
    runwayDays: int
    shortfallAmount: float
    bufferThreshold: float
    projectedBalance: float
    confidenceScore: int
    riskLevel: Literal["HIGH_RISK", "MEDIUM_RISK", "STABLE"]
    summaryEn: str
    summaryHi: str
    factors: list[ShortfallFactor]


class GapAlertItem(BaseModel):
    id: str
    businessId: str
    dayOffset: int
    alertDate: str
    gapStartDate: str
    shortfallAmount: float
    projectedBalance: float
    bufferThreshold: float
    confidencePct: int
    severity: Literal["CRITICAL", "WARNING", "INFO"]
    headlineEn: str
    headlineHi: str


# ---------------------------------------------------------------------------
# Receivables / Invoice Schemas
# ---------------------------------------------------------------------------
class InvoiceItem(BaseModel):
    id: str
    invoiceNumber: str
    customerName: str
    city: str
    amount: float
    invoiceDate: str
    dueDate: str
    predictedPayDate: str
    predictedDelayDays: int
    historicalAvgDelay: int
    paymentReliabilityScore: int
    riskTier: Literal["critical", "moderate", "safe"]
    status: Literal["pending", "partially_paid", "disputed"]
    linkedToBridgeOffer: Optional[bool] = False


# ---------------------------------------------------------------------------
# Loan Schemas
# ---------------------------------------------------------------------------
class KeyFactItem(BaseModel):
    labelEn: str
    labelHi: str
    valueEn: str
    valueHi: str


class LoanOffer(BaseModel):
    offerId: str
    lenderName: str
    lenderType: str
    rbiRegulated: bool
    sanctionedAmount: float
    tenureDays: int
    interestRateFlatPercent: float
    interestAmount: float
    processingFeePercent: float
    processingFeeAmount: float
    gstOnFee: float
    netDisbursalAmount: float
    totalRepayableAmount: float
    linkedInvoiceNumber: str
    linkedCustomerName: str
    linkedInvoiceAmount: float
    autoRepayMechanism: str
    estimatedRepaymentDate: str
    keyFactsStatement: list[KeyFactItem]
    isSimulated: bool = True
    disclaimer: str = "This is a demonstration bridge micro-loan provided by a simulated lender. Regulated digital lending compliance mock."


class LoanOfferRequest(BaseModel):
    alertId: Optional[str] = None
    businessId: str = "MSME0002"
    customAmount: Optional[float] = None


class LoanAcceptRequest(BaseModel):
    offerId: str
    consentAgreed: bool
    linkedInvoiceNumber: str
    businessId: str = "MSME0002"


class LoanAcceptResponse(BaseModel):
    loanId: str
    disbursedAmount: float
    disbursalTimestamp: str
    targetAccountMasked: str
    status: Literal["DISBURSED", "PROCESSING"]
    repaymentDueDate: str
    linkedInvoiceNumber: str


# ---------------------------------------------------------------------------
# Assistant / LLM Chat Schemas
# ---------------------------------------------------------------------------
class AssistantAskRequest(BaseModel):
    question: str
    language: Literal["en", "hi"] = "en"
    businessId: str = "MSME0002"


class AssistantAskResponse(BaseModel):
    answer: str
    language: Literal["en", "hi"]
    intent: str
    confidence: float
    groundingData: Optional[dict] = None


# ---------------------------------------------------------------------------
# Connector Schemas
# ---------------------------------------------------------------------------
class ConnectResponse(BaseModel):
    sourceId: str
    status: Literal["connected", "error"]
    message: str
    recordsImported: int = 0
