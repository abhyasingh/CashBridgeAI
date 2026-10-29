import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  FileWarning, 
  Receipt, 
  Users, 
  Sparkles,
  Info
} from 'lucide-react';
import { forecastApi } from '../api/forecastApi';
import type { ShortfallAnalysis } from '../mocks/shortfall.mock';
import { LedgerButton } from '../components/common/LedgerButton';
import { StampTag } from '../components/common/StampTag';
import { TabularMoney } from '../components/common/TabularMoney';

export const AlertPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHindi = i18n.language.startsWith('hi');

  const [analysis, setAnalysis] = useState<ShortfallAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAlert() {
      try {
        const res = await forecastApi.getShortfallAnalysis();
        setAnalysis(res.data);
      } finally {
        setLoading(false);
      }
    }
    loadAlert();
  }, []);

  if (loading || !analysis) {
    return (
      <div className="min-h-screen bg-[#F7F4EC] p-8 flex items-center justify-center">
        <div className="font-mono text-sm text-ink-muted">Loading shortfall analysis...</div>
      </div>
    );
  }

  const categoryIcons = {
    invoice_delay: FileWarning,
    tax_statutory: Receipt,
    payroll: Users,
    supplier: Receipt,
  };

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-ink-primary paper-texture py-8 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* HEADER BREADCRUMB */}
        <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted">
          <span onClick={() => navigate('/dashboard')} className="hover:underline cursor-pointer">
            Dashboard
          </span>
          <span>/</span>
          <span className="text-ink-primary font-bold">Shortfall Deep Dive</span>
        </div>

        {/* HERO SHORTFALL SUMMARY CARD */}
        <div className="bg-[#FAF7F0] border-2 border-brick-danger rounded-[4px] p-6 shadow-ledger-lg relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-paper-ruled">
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <StampTag label={t('alert.shortfallBadge')} variant="critical" size="md" rotate />
                <span className="text-xs font-mono font-bold text-teal-safe bg-teal-tint px-2 py-0.5 rounded border border-teal-safe/30">
                  {t('alert.confidenceLabel')}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ink-primary">
                {t('alert.title')}
              </h1>
              <p className="text-sm sm:text-base text-ink-secondary">
                {isHindi ? analysis.summaryHi : analysis.summaryEn}
              </p>
            </div>

            <div className="bg-paper-card border border-paper-line rounded p-4 text-center shrink-0 min-w-[200px]">
              <span className="text-[11px] font-mono text-ink-muted uppercase block">
                {t('alert.runwayCountdown')}
              </span>
              <span className="text-4xl font-black font-serif text-brick-danger block my-1">
                18 {isHindi ? 'दिन' : 'Days'}
              </span>
              <span className="text-[11px] font-mono text-ink-muted">
                Safe Until: 17 Nov 2026
              </span>
            </div>
          </div>

          {/* Micro Balance Ledger Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs font-mono">
            <div>
              <span className="text-ink-muted block">Projected Cash on Day 18</span>
              <span className="text-lg font-bold text-ink-primary font-sans">
                <TabularMoney amount={analysis.projectedBalance} format="detail" />
              </span>
            </div>
            <div>
              <span className="text-ink-muted block">Minimum Safety Buffer</span>
              <span className="text-lg font-bold text-ink-secondary font-sans">
                <TabularMoney amount={analysis.bufferThreshold} format="detail" />
              </span>
            </div>
            <div>
              <span className="text-brick-danger font-bold block">Deficit To Be Bridged</span>
              <span className="text-lg font-black text-brick-danger font-sans">
                <TabularMoney amount={analysis.shortfallAmount} format="detail" />
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: "WHY?" EXPLAINABLE CONTRIBUTION FACTORS (RANKED BARS) */}
        <div className="bg-paper-card border border-paper-line rounded-[4px] p-6 shadow-ledger space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-saffron block mb-1">
              {isHindi ? 'पारदर्शी AI विश्लेषण' : 'EXPLAINABLE AI ENGINE'}
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink-primary">
              {t('alert.whyTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">
              {t('alert.whySubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {analysis.factors.map((factor, index) => {
              const Icon = categoryIcons[factor.category] || Info;
              return (
                <div
                  key={factor.id}
                  className="bg-white/90 border border-paper-line rounded-[3px] p-4 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded bg-paper-subtle border border-paper-line flex items-center justify-center text-ink-secondary shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-ink-muted">
                            #{index + 1}
                          </span>
                          <h3 className="font-sans font-bold text-sm sm:text-base text-ink-primary">
                            {isHindi ? factor.titleHi : factor.titleEn}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 sm:text-right">
                      <div className="text-right">
                        <span className="font-serif font-black text-base text-ink-primary block leading-none">
                          <TabularMoney amount={factor.impactAmount} format="detail" />
                        </span>
                        <span className="text-[11px] font-mono text-brick-danger font-bold">
                          {factor.percentageContribution}% Impact
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Impact Progress Bar */}
                  <div className="w-full bg-paper-subtle rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.percentageContribution > 40
                          ? 'bg-brick-danger'
                          : factor.percentageContribution > 25
                          ? 'bg-amber-600'
                          : 'bg-ink-muted'
                      }`}
                      style={{ width: `${factor.percentageContribution}%` }}
                    />
                  </div>

                  <p className="text-xs text-ink-muted leading-relaxed font-sans">
                    {isHindi ? factor.descriptionHi : factor.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ONE-TAP BRIDGE LOAN INVITATION BANNER */}
        <div className="bg-[#FFF9F3] border-2 border-saffron rounded-[4px] p-6 shadow-ledger flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-saffron" />
              <span className="font-mono text-xs font-bold text-saffron uppercase">
                Invoice-Linked Solution Ready
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink-primary">
              {t('alert.bridgeOfferBanner')}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted">
              Pre-approved micro-loan from Shivalik Small Finance Bank. Automatically settled when Kapoor Retailers pays Invoice #INV-2026-089.
            </p>
          </div>

          <LedgerButton
            variant="saffron"
            size="lg"
            onClick={() => navigate('/loan')}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            {t('alert.unlockBridge')}
          </LedgerButton>
        </div>
      </div>
    </div>
  );
};
