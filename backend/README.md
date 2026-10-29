# CashBridge AI — Backend Service

> FastAPI backend predicting cash-flow shortfalls for Indian MSMEs weeks in advance and offering one-tap invoice-linked micro-loans.

---

## Architecture & Directory Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization, CORS, versioned routes mounting
│   ├── config.py            # Pydantic environment settings & loan pricing parameters
│   ├── db/
│   │   ├── session.py       # SQLAlchemy engine (SQLite with WAL mode) & get_db dependency
│   │   └── __init__.py
│   ├── models/
│   │   ├── orm.py           # Canonical ORM models: Business, Customer, Invoice, Expense, BankTxn, Loan, AuditLog
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── api_schemas.py   # Pydantic v2 schemas wrapped with ApiResponse[T]
│   │   └── __init__.py
│   ├── api/
│   │   └── routes/          # health, connect, business, forecast, alerts, receivables, loan, assistant
│   ├── services/            # business_service, forecast_service, receivables_service, loan_service, assistant_service
│   ├── ml/
│   │   ├── interfaces.py    # InvoiceDelayPredictor, CashForecastEngine interfaces
│   │   ├── delay_predictor.py # Customer-level Bayesian shrinkage delay predictor
│   │   └── forecast_engine.py # 13-week 1,000-run Monte Carlo simulation engine
│   ├── connectors/          # tally_connector (XML), csv_connector, simulated_connectors (QuickBooks, Bank AA)
│   ├── bot/
│   │   ├── telegram_bot.py  # Bilingual (EN/HI) Telegram bot with inline action buttons
│   │   ├── chart_renderer.py# Matplotlib cash forecast chart generator
│   │   └── run.py           # Telegram bot standalone process entrypoint
│   └── utils/
├── data/
│   ├── raw/                 # Clean snapshot of Kaggle/Udyam raw simulation CSVs
│   ├── processed/           # Canonical transformed CSVs
│   └── cashbridge_dev.db    # Seeded SQLite database (WAL mode)
├── scripts/
│   ├── profile_data.py      # Automated dataset profiling and validation
│   ├── clean_data.py        # Transformation script to canonical schema
│   └── seed.py              # Database populator & demo persona initializer
├── tests/
│   └── test_api.py          # Pytest suite: endpoints, loan math, CSV validation, Tally XML
├── .env.example
├── pyproject.toml           # Ruff & pytest configuration
└── requirements.txt
```

---

## Setup & Running Instructions

### 1. Requirements
- Python 3.11+
- Virtual environment recommended

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Database Migration & Seeding
```bash
python scripts/clean_data.py
python scripts/seed.py
```
This initializes the SQLite database with 120 MSMEs, 3,257 customers, 53,117 invoices, and the demo business **"Sharma Garments, Lucknow" (MSME0002)**.

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000/api/v1`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`

### 5. Run Test Suite
```bash
pytest tests -v
```
All 13 test suites verify:
- Endpoints: `/health`, `/business/profile`, `/business/summary`, `/forecast`, `/alerts`, `/receivables`, `/loan/offer`, `/loan/accept`, `/assistant/ask`
- Loan sizing formula: `shortfall x 1.1` rounded up to ₹5,000, 1.5% fee, APR by risk band
- Regulatory consent enforcement for loan disbursal
- CSV parser validation for invoice and bank statement uploads
- Tally Prime XML export voucher parsing
- Bilingual Hindi and English assistant intent routing

### 6. Linting
```bash
ruff check backend
```

### 7. Run Telegram Bot (Optional)
1. Get a bot token from [@BotFather](https://t.me/botfather).
2. Set `TELEGRAM_BOT_TOKEN=your_token` in `backend/.env`.
3. Start the bot process:
```bash
python -m app.bot.run
```
Available commands: `/start`, `/summary`, `/forecast` (renders chart image), `/alert` (with inline [Why?] and [Get Loan] buttons), `/loan`, `/lang` (toggle English/Hindi).

---

## REST Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status and snapshot anchor |
| `POST`| `/connect/{source}` | Ingest from `tally` (XML), `csv` (file), or simulated `quickbooks` / `bank` |
| `GET` | `/business/{id}/profile` | Business profile, credit limits, connected connectors |
| `GET` | `/business/{id}/summary` | Executive KPI strip (safe cash runway days, inflows, outflows) |
| `GET` | `/business/{id}/forecast` | 13-week probabilistic cash projection (P10, P50, P90, buffer) |
| `GET` | `/business/{id}/alerts` | Active shortfall gap alerts (Day 18, shortfall amount, confidence) |
| `GET` | `/alerts/{id}/explain?lang=en\|hi` | Plain-language ranked reasons for the cash deficit |
| `GET` | `/business/{id}/receivables` | Invoices with predicted payment dates and delay risk tiers |
| `POST`| `/loan/offer` | Sized bridge micro-loan offer with Key Facts Statement |
| `POST`| `/loan/accept` | Consent-based simulated loan disbursal with audit log |
| `POST`| `/assistant/ask` | Grounded bilingual assistant query answering |

All responses return standard `{ "data": T, "status": "success", "timestamp": "..." }` format.
