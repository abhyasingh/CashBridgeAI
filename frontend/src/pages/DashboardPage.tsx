import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  ShieldAlert, 
  TrendingUp, 
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { forecastApi } from '../api/forecastApi';
import type { ForecastDataPoint } from '../mocks/forecast.mock';
import { TabularMoney } from '../components/common/TabularMoney';
import { LedgerButton } from '../components/common/LedgerButton';
import { StampTag } from '../components/common/StampTag';
import { formatCurrencyCompact, formatCurrencyDetail } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [forecast, setForecast] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const forecastRes = await forecastApi.get13WeekForecast();
        setForecast(forecastRes.data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EC] p-8 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-ink-muted font-mono text-sm">
          <span className="w-3 h-3 bg-saffron rounded-full animate-ping" />
          <span>Loading 13-week forecast ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-ink-primary paper-texture py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* TOP HERO ALERT BANNER: Safe cash for next 18 days */}
        <div className="bg-[#FAF7F0] border-2 border-brick-danger rounded-[4px] p-6 shadow-ledger-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-brick-tint rounded-bl-full pointer-events-none -z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center space-x-2.5">
                <StampTag
                  label="GAP DETECTED • 82% CONFIDENCE"
                  variant="critical"
                  size="sm"
                  rotate
                />
                <span className="text-xs font-mono text-ink-muted">
                  Model: Lag-Weighted AR-13
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-ink-primary tracking-tight">
                {t('dashboard.runwayHero')}
              </h1>

              <p className="text-sm sm:text-base text-ink-secondary">
                {t('dashboard.runwaySubtitle')}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <LedgerButton
                variant="danger"
                size="lg"
                onClick={() => navigate('/alert')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                {t('dashboard.bridgeCta')}
              </LedgerButton>
            </div>
          </div>
        </div>

        {/* KPI LEDGER STRIP (4 Ruled Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Current Balance */}
          <div className="bg-paper-card border border-paper-line rounded-[3px] p-4 shadow-ledger">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1 font-medium">
              <span>{t('dashboard.kpi.currentBalance')}</span>
              <span className="w-2 h-2 rounded-full bg-teal-safe" />
            </div>
            <div className="text-2xl font-black text-ink-primary font-serif">
              <TabularMoney amount={485000} format="detail" />
            </div>
            <div className="mt-2 text-[11px] font-mono text-ink-muted">
              HDFC Bank (•••• 4912) • Live Sync
            </div>
          </div>

          {/* Card 2: Expected Inflow 7 Days */}
          <div className="bg-paper-card border border-paper-line rounded-[3px] p-4 shadow-ledger">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1 font-medium">
              <span>{t('dashboard.kpi.inflow7Days')}</span>
              <TrendingUp className="w-3.5 h-3.5 text-teal-safe" />
            </div>
            <div className="text-2xl font-black text-teal-safe font-serif">
              +<TabularMoney amount={120000} format="detail" />
            </div>
            <div className="mt-2 text-[11px] font-mono text-ink-muted">
              Awadh Fabrics (Due Day 8)
            </div>
          </div>

          {/* Card 3: Outflow Due 15 Days */}
          <div className="bg-paper-card border border-paper-line rounded-[3px] p-4 shadow-ledger">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1 font-medium">
              <span>{t('dashboard.kpi.outflow15Days')}</span>
              <Clock className="w-3.5 h-3.5 text-brick-danger" />
            </div>
            <div className="text-2xl font-black text-brick-danger font-serif">
              -<TabularMoney amount={255000} format="detail" />
            </div>
            <div className="mt-2 text-[11px] font-mono text-ink-muted">
              GST (₹1.4L) + Wages (₹1.15L)
            </div>
          </div>

          {/* Card 4: Risk Tier */}
          <div className="bg-paper-card border border-paper-line rounded-[3px] p-4 shadow-ledger">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1 font-medium">
              <span>{t('dashboard.kpi.riskStatus')}</span>
              <ShieldAlert className="w-3.5 h-3.5 text-brick-danger" />
            </div>
            <div className="text-xl font-black text-brick-danger font-serif flex items-center space-x-2">
              <StampTag label="CRITICAL SHORTFALL" variant="critical" size="sm" />
            </div>
            <div className="mt-2 text-[11px] font-mono text-ink-muted">
              Deficit of ₹2.1L on Day 18
            </div>
          </div>
        </div>

        {/* 13-WEEK PROBABILISTIC CASH FORECAST CHART (P10 / P50 / P90) */}
        <div className="bg-[#FAF7F0] border border-paper-line rounded-[4px] p-6 shadow-ledger">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-primary">
                {t('dashboard.chart.title')}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                {t('dashboard.chart.subtitle')}
              </p>
            </div>

            {/* Legend Indicators */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-ink-primary rounded-[2px]" />
                <span className="text-ink-secondary">{t('dashboard.chart.legendP50')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-brick-danger" />
                <span className="text-brick-danger font-semibold">{t('dashboard.chart.legendBuffer')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-[#E2D9C8] border border-paper-line rounded-[2px]" />
                <span className="text-ink-muted">{t('dashboard.chart.legendRange')}</span>
              </div>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={forecast}
                margin={{ top: 15, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid stroke="#EBE2CF" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#7A8794"
                  fontSize={11}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  stroke="#7A8794"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => formatCurrencyCompact(val)}
                  domain={[-50000, 600000]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ForecastDataPoint;
                      return (
                        <div className="bg-[#FAF7F0] border-2 border-paper-line rounded p-3 shadow-lg font-mono text-xs text-ink-primary space-y-1">
                          <p className="font-bold border-b border-paper-line pb-1 text-ink-primary">
                            {data.label} ({data.dateStr})
                          </p>
                          <p className="text-ink-primary">
                            P50 (Expected): <span className="font-bold">{formatCurrencyDetail(data.p50)}</span>
                          </p>
                          <p className="text-ink-muted text-[11px]">
                            P90 (Optimistic): {formatCurrencyDetail(data.p90)}
                          </p>
                          <p className="text-ink-muted text-[11px]">
                            P10 (Stress): {formatCurrencyDetail(data.p10)}
                          </p>
                          {data.isDeficit && (
                            <p className="text-brick-danger font-bold pt-1 border-t border-paper-line">
                              Deficit below buffer: {formatCurrencyDetail(data.deficitAmount)}
                            </p>
                          )}
                          {data.eventNote && (
                            <p className="text-saffron font-bold text-[10px] italic">
                              • {data.eventNote}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Minimum Safe Cash Buffer Reference Line */}
                <ReferenceLine
                  y={250000}
                  stroke="#B83227"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: 'Safe Buffer: ₹2.5L',
                    fill: '#B83227',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />

                {/* Confidence Range Area (P10 to P90) */}
                <Area
                  type="monotone"
                  dataKey="p90"
                  stroke="transparent"
                  fill="#E2D9C8"
                  fillOpacity={0.35}
                />
                <Area
                  type="monotone"
                  dataKey="p10"
                  stroke="transparent"
                  fill="#FAF7F0"
                  fillOpacity={1}
                />

                {/* Main Cash Balance Line (P50) */}
                <Line
                  type="monotone"
                  dataKey="p50"
                  stroke="#111A24"
                  strokeWidth={2.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.day === 18) {
                      return (
                        <circle
                          key={payload.day}
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill="#B83227"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-paper-line flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-ink-muted gap-2 font-mono">
            <span>Red dot on Day 18 indicates peak deficit point (₹40K projected balance).</span>
            <button
              onClick={() => navigate('/alert')}
              className="text-saffron hover:underline font-bold font-sans flex items-center"
            >
              Analyze why Day 18 dips →
            </button>
          </div>
        </div>

        {/* BOTTOM QUICK ACTIONS LEDGER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Action 1: Receivables */}
          <div className="bg-paper-card border border-paper-line rounded-[3px] p-5 shadow-ledger flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-saffron uppercase font-bold">14 Open Invoices</span>
              <h3 className="font-serif font-bold text-lg text-ink-primary">
                Kapoor Retailers (₹1.85L) delayed by 27 days
              </h3>
              <p className="text-xs text-ink-muted">
                Historical collection lag is 41 days. Predicted pay date: 20 Nov 2026.
              </p>
            </div>
            <LedgerButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/receivables')}
            >
              View Invoices
            </LedgerButton>
          </div>

          {/* Quick Action 2: Bridge Credit */}
          <div className="bg-paper-card border border-paper-line rounded-[3px] p-5 shadow-ledger flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-teal-safe uppercase font-bold">Pre-Approved Facility</span>
              <h3 className="font-serif font-bold text-lg text-ink-primary">
                ₹2.3L Bridge Micro-Loan Ready
              </h3>
              <p className="text-xs text-ink-muted">
                One-tap disbursal by Shivalik Small Finance Bank. Auto-settles when invoice clears.
              </p>
            </div>
            <LedgerButton
              variant="saffron"
              size="sm"
              onClick={() => navigate('/loan')}
            >
              1-Tap Loan
            </LedgerButton>
          </div>
        </div>
      </div>
    </div>
  );
};
