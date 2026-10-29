import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Link as LinkIcon, 
  CheckCircle 
} from 'lucide-react';
import { LedgerButton } from '../components/common/LedgerButton';
import { CashBridgeHeroStory } from '../components/hero/CashBridgeHeroStory';
import { LiveRiskTicker } from '../components/hero/LiveRiskTicker';
import { StampTag } from '../components/common/StampTag';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHindi = i18n.language.startsWith('hi');

  const scrollToHow = () => {
    const el = document.getElementById('how-it-works-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const timelineSteps = [
    {
      num: '01',
      title: t('home.howItWorks.step1Title'),
      desc: t('home.howItWorks.step1Desc'),
      icon: LinkIcon,
      accent: 'border-ink-muted',
    },
    {
      num: '02',
      title: t('home.howItWorks.step2Title'),
      desc: t('home.howItWorks.step2Desc'),
      icon: TrendingUp,
      accent: 'border-ink-secondary',
    },
    {
      num: '03',
      title: t('home.howItWorks.step3Title'),
      desc: t('home.howItWorks.step3Desc'),
      icon: Clock,
      accent: 'border-brick-danger',
    },
    {
      num: '04',
      title: t('home.howItWorks.step4Title'),
      desc: t('home.howItWorks.step4Desc'),
      icon: Sparkles,
      accent: 'border-saffron',
    },
    {
      num: '05',
      title: t('home.howItWorks.step5Title'),
      desc: t('home.howItWorks.step5Desc'),
      icon: CheckCircle,
      accent: 'border-teal-safe',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-ink-primary paper-texture">
      {/* SECTION 1: HERO (Showpiece) */}
      <section className="relative pt-6 pb-14 md:pt-10 md:pb-20 border-b border-paper-ruled">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Live Risk Ticker Strip */}
          <div className="mb-8">
            <LiveRiskTicker />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div>
                <StampTag
                  label={t('home.badge')}
                  variant="saffron"
                  size="sm"
                  className="mb-4"
                />
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink-primary leading-[1.15]">
                  {t('home.headline')}
                </h1>
              </div>

              <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-sans font-normal">
                {t('home.subheadline')}
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <LedgerButton
                  variant="saffron"
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  {t('home.ctaForecast')}
                </LedgerButton>

                <LedgerButton
                  variant="outline"
                  size="lg"
                  onClick={scrollToHow}
                >
                  {t('home.ctaHow')}
                </LedgerButton>
              </div>

              {/* Trust Badge Micro-Strip */}
              <div className="pt-4 border-t border-paper-ruled flex items-center space-x-3 text-xs text-ink-muted">
                <div className="w-2 h-2 rounded-full bg-teal-safe shrink-0" />
                <p className="leading-snug">
                  {t('home.trustedBy')}
                </p>
              </div>
            </div>

            {/* Right Column: 12-Second Framer Motion Story Simulation */}
            <div className="lg:col-span-7">
              <CashBridgeHeroStory />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS (Asymmetric Timeline - avoids 3-card pattern) */}
      <section id="how-it-works-section" className="py-16 md:py-24 border-b border-paper-ruled bg-[#F4EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-saffron block mb-2">
              {isHindi ? 'कार्यप्रणाली' : 'WORKFLOW TIMELINE'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ink-primary leading-tight">
              {t('home.howItWorks.title')}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink-muted">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          {/* Connected Horizontal Timeline Rail */}
          <div className="relative">
            {/* Ruled connecting wire line on desktop */}
            <div className="hidden lg:block absolute top-12 left-6 right-6 h-[2px] bg-paper-line z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
              {timelineSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.num}
                    className="bg-paper-card border border-paper-line rounded-[3px] p-5 shadow-ledger flex flex-col justify-between hover:border-ink-muted transition-colors relative"
                  >
                    <div>
                      {/* Step Number Stamp */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs font-black text-ink-muted px-2 py-0.5 rounded bg-paper-subtle border border-paper-line">
                          STEP {step.num}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white border border-paper-line flex items-center justify-center text-ink-primary shadow-2xs">
                          <StepIcon className="w-4 h-4 text-ink-secondary" />
                        </div>
                      </div>

                      <h3 className="font-serif text-base font-bold text-ink-primary mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-paper-ruled flex items-center justify-between text-[11px] font-mono text-ink-muted">
                      <span>Sharma Garments</span>
                      <span className="text-saffron font-bold">→ Verified</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRUST, CONSENT & REGULATORY NORMS (Editorial 3-Pillar Ledger Layout) */}
      <section className="py-16 md:py-20 border-b border-paper-ruled bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 border-ink-primary pl-4 mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-primary">
              {t('home.trust.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="border-t-2 border-ink-primary pt-4">
              <span className="font-mono text-xs text-saffron font-bold block mb-1">RULE 01</span>
              <h3 className="font-serif text-lg font-bold text-ink-primary mb-2">
                {t('home.trust.pillar1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('home.trust.pillar1Desc')}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="border-t-2 border-ink-primary pt-4">
              <span className="font-mono text-xs text-teal-safe font-bold block mb-1">RULE 02</span>
              <h3 className="font-serif text-lg font-bold text-ink-primary mb-2">
                {t('home.trust.pillar2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('home.trust.pillar2Desc')}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="border-t-2 border-ink-primary pt-4">
              <span className="font-mono text-xs text-brick-danger font-bold block mb-1">RULE 03</span>
              <h3 className="font-serif text-lg font-bold text-ink-primary mb-2">
                {t('home.trust.pillar3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('home.trust.pillar3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: EDITORIAL FOOTER */}
      <footer className="py-10 bg-[#EFE9DC] text-ink-secondary border-t border-paper-ruled">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <span className="font-serif font-bold text-ink-primary text-sm">
              CashBridge<span className="text-saffron">.ai</span>
            </span>
            <span className="text-ink-faint">|</span>
            <span>Indian MSME Cash Intelligence & Liquidity Bridge</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center text-teal-safe">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-safe mr-1.5" />
              RBI Digital Lending Compliant
            </span>
            <span className="text-ink-muted">© 2026 Sharma Garments Demo</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
