import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  FileCheck
} from 'lucide-react';
import { loanApi } from '../api/loanApi';
import type { LoanOffer } from '../mocks/loan.mock';
import { LedgerButton } from '../components/common/LedgerButton';
import { StampTag } from '../components/common/StampTag';
import { TabularMoney } from '../components/common/TabularMoney';
import { formatCurrencyDetail } from '../utils/formatters';

export const LoanPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHindi = i18n.language.startsWith('hi');

  const [offer, setOffer] = useState<LoanOffer | null>(null);
  const [consent, setConsent] = useState<boolean>(false);
  const [isDisbursing, setIsDisbursing] = useState<boolean>(false);
  const [disbursed, setDisbursed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadOffer() {
      try {
        const res = await loanApi.getOffer();
        setOffer(res.data);
      } finally {
        setLoading(false);
      }
    }
    loadOffer();
  }, []);

  const handleDisburse = async () => {
    if (!consent || !offer) return;
    setIsDisbursing(true);

    try {
      await loanApi.applyForLoan({
        offerId: offer.offerId,
        consentAgreed: true,
        linkedInvoiceNumber: offer.linkedInvoiceNumber,
      });

      setIsDisbursing(false);
      setDisbursed(true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D9651C', '#1E6B5C', '#111A24', '#F0EAD9'],
        });
      } catch {
        // graceful fallback if canvas not available
      }
    } catch {
      setIsDisbursing(false);
    }
  };

  if (loading || !offer) {
    return (
      <div className="min-h-screen bg-[#F7F4EC] p-8 flex items-center justify-center font-mono text-sm text-ink-muted">
        Loading bridge loan facility...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-ink-primary paper-texture py-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* HEADER */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted mb-2">
            <span onClick={() => navigate('/alert')} className="hover:underline cursor-pointer">
              Day 18 Shortfall
            </span>
            <span>/</span>
            <span className="text-ink-primary font-bold">1-Tap Bridge Facility</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ink-primary">
            {t('loan.title')}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {t('loan.subtitle')}
          </p>
        </div>

        {/* SIMULATION DISCLAIMER BANNER */}
        <div className="bg-[#FAF7F0] border border-paper-line rounded p-3 flex items-center space-x-2.5 text-xs text-ink-secondary">
          <Building2 className="w-4 h-4 text-saffron shrink-0" />
          <span>
            {t('loan.demoDisclaimer')}
          </span>
        </div>

        {!disbursed ? (
          /* PRE-DISBURSAL OFFER STATE */
          <div className="space-y-6">
            {/* OFFER SUMMARY LEDGER CARD */}
            <div className="bg-paper-card border-2 border-paper-line rounded-[4px] p-6 shadow-ledger-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paper-ruled">
                <div>
                  <span className="text-xs font-mono font-bold text-saffron uppercase block mb-1">
                    Pre-Approved Sanction
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-serif text-ink-primary">
                    <TabularMoney amount={offer.sanctionedAmount} format="detail" />
                  </div>
                  <span className="text-xs font-mono text-ink-muted">
                    Facility ID: {offer.offerId}
                  </span>
                </div>

                <div className="sm:text-right space-y-1">
                  <StampTag label="21 DAYS TENURE" variant="saffron" size="md" />
                  <p className="text-xs font-mono text-ink-muted">
                    Auto-expires if not claimed before Day 18
                  </p>
                </div>
              </div>

              {/* Key Figures Ledger Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono border-b border-paper-ruled pb-6">
                <div>
                  <span className="text-ink-muted block">{t('loan.offer.flatInterest')}</span>
                  <span className="text-base font-bold text-ink-primary font-sans">
                    <TabularMoney amount={offer.interestAmount} format="detail" />
                  </span>
                  <span className="text-[10px] text-ink-muted block">1.2% flat rate</span>
                </div>

                <div>
                  <span className="text-ink-muted block">{t('loan.offer.fees')}</span>
                  <span className="text-base font-bold text-ink-primary font-sans">
                    <TabularMoney amount={offer.processingFeeAmount + offer.gstOnFee} format="detail" />
                  </span>
                  <span className="text-[10px] text-ink-muted block">Deducted upfront</span>
                </div>

                <div>
                  <span className="text-teal-safe font-bold block">{t('loan.offer.netDisbursal')}</span>
                  <span className="text-lg font-black text-teal-safe font-sans">
                    <TabularMoney amount={offer.netDisbursalAmount} format="detail" />
                  </span>
                  <span className="text-[10px] text-teal-safe block">Direct IMPS to HDFC</span>
                </div>

                <div>
                  <span className="text-ink-muted block">{t('loan.offer.totalRepayable')}</span>
                  <span className="text-base font-bold text-ink-primary font-sans">
                    <TabularMoney amount={offer.totalRepayableAmount} format="detail" />
                  </span>
                  <span className="text-[10px] text-ink-muted block">Upon invoice payment</span>
                </div>
              </div>

              {/* Linked Invoice Reference */}
              <div className="bg-white/90 border border-paper-line rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-mono text-xs font-bold text-ink-primary uppercase block">
                    Auto-Repay Linked Invoice: {offer.linkedInvoiceNumber}
                  </span>
                  <p className="text-ink-muted text-xs mt-0.5">
                    Customer: <span className="font-bold text-ink-primary">{offer.linkedCustomerName}</span> (Receivable amount: {formatCurrencyDetail(offer.linkedInvoiceAmount)})
                  </p>
                </div>
                <StampTag label="AUTO-SETTLEMENT ON RECEIPT" variant="safe" size="sm" />
              </div>
            </div>

            {/* KEY FACTS STATEMENT (KFS) - RBI NORM ACCORDION/STRIP */}
            <div className="bg-[#FAF7F0] border border-paper-line rounded p-5 space-y-4">
              <div className="flex items-center space-x-2 text-ink-primary">
                <FileCheck className="w-5 h-5 text-teal-safe" />
                <h3 className="font-serif font-bold text-base">
                  {t('loan.kfsTitle')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {offer.keyFactsStatement.map((kfs, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-paper-line/70">
                    <span className="text-ink-muted font-medium">
                      {isHindi ? kfs.labelHi : kfs.labelEn}
                    </span>
                    <span className="font-bold font-mono text-ink-primary">
                      {isHindi ? kfs.valueHi : kfs.valueEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CONSENT & DISBURSAL CTA */}
            <div className="bg-paper-card border border-paper-line rounded p-6 space-y-5">
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-paper-line text-saffron focus:ring-saffron"
                />
                <span className="text-xs sm:text-sm text-ink-secondary leading-snug">
                  {t('loan.consentCheckbox')}
                </span>
              </label>

              <LedgerButton
                variant="saffron"
                size="lg"
                disabled={!consent}
                loading={isDisbursing}
                onClick={handleDisburse}
                className="w-full text-base py-4"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                {isDisbursing ? t('loan.disbursing') : t('loan.ctaDisburse')}
              </LedgerButton>

              <p className="text-[11px] text-center text-ink-muted font-mono">
                Disbursed securely under RBI Master Direction on Digital Lending 2022. No physical paperwork needed.
              </p>
            </div>
          </div>
        ) : (
          /* POST-DISBURSAL SUCCESS STATE */
          <div className="bg-[#FAF7F0] border-2 border-teal-safe rounded-[4px] p-8 shadow-ledger-lg space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-teal-tint text-teal-safe flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <StampTag label="LOAN DISBURSED • ₹2,29,457 CREDITED" variant="safe" size="lg" rotate />
              <h2 className="font-serif text-3xl font-black text-ink-primary mt-2">
                {t('loan.success.title')}
              </h2>
              <p className="text-sm sm:text-base text-ink-secondary max-w-xl mx-auto">
                {t('loan.success.message')}
              </p>
            </div>

            {/* Repayment Timeline Card */}
            <div className="bg-paper-card border border-paper-line rounded p-5 max-w-xl mx-auto text-left space-y-3">
              <span className="text-xs font-mono font-bold text-ink-muted uppercase block">
                {t('loan.success.timelineTitle')}
              </span>
              <div className="flex items-center justify-between text-xs border-b border-paper-line pb-2">
                <span className="text-ink-secondary">Day 0 (Today)</span>
                <span className="font-bold text-teal-safe font-mono">+₹2,29,457 Inflow (IMPS)</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-paper-line pb-2">
                <span className="text-ink-secondary">Day 18 (17 Nov)</span>
                <span className="font-bold text-teal-safe font-mono">Shortfall Covered Safely</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary">Day 39 (Est. Kapoor Payment)</span>
                <span className="font-bold text-ink-primary font-mono">Auto-Debit ₹2,32,760</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <LedgerButton
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard')}
              >
                {t('loan.success.returnHome')}
              </LedgerButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
