# CashBridge AI — Frontend

> Indian MSME cash-flow intelligence & one-tap invoice-linked micro-loan platform.  
> Demo business: **Sharma Garments, Lucknow** · 13-week P10/P50/P90 forecast · Day 18 ₹2.1L shortfall · ₹2.3L bridge loan

---

## Quick Start

> **Node.js 18+ required.** All commands from the `frontend/` directory.

### 1. Install dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

### 2. Start development server
```bash
npm run dev
```
Binds to local and network interfaces:
- Local: **http://localhost:5173**
- Network: **http://&lt;your-local-ip&gt;:5173** (accessible from other devices on the same Wi-Fi/LAN)

### 3. Production build
```bash
npm run build
```
Output in `frontend/dist/`

### 4. Preview production build locally
```bash
npm run preview
```

---

## Tech Stack

| Layer | Package | Version |
|-------|---------|---------|
| Framework | React | 18.3.1 |
| Build tool | Vite | 5.4.19 |
| Language | TypeScript | 5.7.3 |
| Styling | Tailwind CSS | 3.4.17 |
| Animation | Framer Motion | 11.x |
| Charts | Recharts | 2.13.3 |
| Icons | lucide-react | 0.468.0 |
| Routing | react-router-dom | 6.28.1 |
| i18n | i18next + react-i18next | 23.x / 15.x |

---

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Hero animation + How it works |
| `/connect` | Connect | Link Tally / QuickBooks / Bank / CSV |
| `/dashboard` | Dashboard | 13-week forecast chart + KPIs |
| `/alert` | Alert | Shortfall deep-dive + Why? panel |
| `/receivables` | Receivables | Invoice table with delay predictions |
| `/loan` | Loan | One-tap bridge loan flow |

---

## Project Structure

```
frontend/
├── src/
│   ├── api/                  # Service layer (swap mock → real API here)
│   │   ├── client.ts         # simulateApiCall wrapper
│   │   ├── businessApi.ts
│   │   ├── forecastApi.ts
│   │   ├── invoiceApi.ts
│   │   └── loanApi.ts
│   ├── mocks/                # Realistic demo data
│   │   ├── business.mock.ts  # Sharma Garments profile
│   │   ├── forecast.mock.ts  # 13-week P10/P50/P90 + live ticker
│   │   ├── invoices.mock.ts  # 14 open invoices with delay history
│   │   ├── shortfall.mock.ts # Day 18 analysis + 3 causal factors
│   │   └── loan.mock.ts      # ₹2.3L / 21-day bridge offer
│   ├── locales/
│   │   ├── en.json           # English i18n keys
│   │   └── hi.json           # Hindi i18n keys (natural spoken Hindi)
│   ├── components/
│   │   ├── common/           # LedgerButton, StampTag, TabularMoney, Header, MobileNav, LanguageToggle
│   │   ├── hero/             # CashBridgeHeroStory (12s animation), LiveRiskTicker
│   │   └── assistant/        # KhataAssistantModal (UI only, mocked replies)
│   ├── pages/                # HomePage, DashboardPage, AlertPage, ReceivablesPage, LoanPage, ConnectPage
│   ├── utils/
│   │   └── formatters.ts     # INR lakh/crore formatting with Intl
│   ├── i18n.ts               # i18next setup with localStorage persistence
│   ├── App.tsx               # BrowserRouter + routes + floating assistant button
│   └── main.tsx              # React entry point
├── public/
├── index.html                # Google Fonts: Fraunces, Manrope, Noto Sans Devanagari
├── tailwind.config.js        # Design tokens: paper/ink/saffron/teal/brick palette
├── vite.config.ts            # Code splitting: react-core / charts / motion / i18n chunks
├── tsconfig.app.json
└── package.json
```

---

## Design System

### Color Tokens (Tailwind)
| Token | Value | Use |
|-------|-------|-----|
| `paper-bg` | `#F7F4EC` | Page background |
| `ink-primary` | `#111A24` | Main text / headings |
| `saffron` | `#D9651C` | Primary accent / CTA |
| `teal-safe` | `#1E6B5C` | Safe state / positive |
| `brick-danger` | `#B83227` | Risk / shortfall / danger |

### Fonts
- **Display/headings**: Fraunces (serif)
- **UI/body**: Manrope (humanist sans)
- **Hindi**: Noto Sans Devanagari
- **Monospace/tables**: system mono

---

## i18n — Adding Keys

1. Add key to `src/locales/en.json` under the appropriate namespace (`home`, `dashboard`, `alert`, etc.)
2. Add the Hindi translation to `src/locales/hi.json` (natural spoken Hindi, not literal)
3. Use in component: `const { t } = useTranslation(); t('namespace.key')`
4. Language toggle in header persists to `localStorage` key `i18nextLng`

### Adding a new language
1. Create `src/locales/XX.json` mirroring `en.json` structure
2. In `src/i18n.ts`, add `XX` to the `resources` object and `supportedLngs` array

---

## Replacing Mocks with Real API

Each file in `src/api/` maps to a future FastAPI endpoint:

| API method | Mock source | Future endpoint |
|-----------|-------------|-----------------|
| `forecastApi.get13WeekForecast()` | `mockForecastData` | `GET /api/v1/forecast/13-week` |
| `forecastApi.getShortfallAnalysis()` | `mockShortfallAnalysis` | `GET /api/v1/forecast/shortfall` |
| `forecastApi.getLiveTicker()` | `mockLiveTicker` | `GET /api/v1/alerts/ticker` |
| `invoiceApi.getInvoices()` | `mockInvoices` | `GET /api/v1/invoices` |
| `loanApi.getOffer()` | `mockLoanOffer` | `GET /api/v1/loan/offer` |
| `loanApi.applyForLoan()` | simulated | `POST /api/v1/loan/apply` |
| `businessApi.getProfile()` | `mockBusiness` | `GET /api/v1/business/profile` |

Replace `simulateApiCall(mockData)` with `fetch('/api/v1/...')` in each api file. Components need zero changes.

---

## Known Issues / TODO

- Chunk size: single JS bundle ~856KB (gzip: 255KB). Code-splitting configured in vite.config.ts.
- Voice assistant (Khata AI button) is UI-only with mocked responses — needs real NLP/LLM integration.
- Backend folder exists with only a README — FastAPI service to be built after frontend.
- Real connectors (Tally Prime API, QuickBooks OAuth, Account Aggregator) pending.
- WhatsApp/Telegram bot for Hindi-first access pending.

---

## How to Resume with a Different AI

1. Read `/track.readme.md` in the project root for full context, work log, and design system.
2. `cd frontend && npm install --legacy-peer-deps` to restore node_modules.
3. `npm run dev` to start the dev server at localhost:5173.
4. All pages are complete. Backend (`/backend/`) only has a README placeholder.
5. To replace mocks: edit files in `src/api/` only — zero component changes needed.
