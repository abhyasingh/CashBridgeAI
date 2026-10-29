import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search
} from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import type { InvoiceItem } from '../mocks/invoices.mock';
import { TabularMoney } from '../components/common/TabularMoney';
import { StampTag } from '../components/common/StampTag';
import { LedgerButton } from '../components/common/LedgerButton';
import { formatDateShort } from '../utils/formatters';

export const ReceivablesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'moderate' | 'safe'>('all');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'delay' | 'amount' | 'dueDate'>('delay');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await invoiceApi.getInvoices();
        setInvoices(res.data);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const filteredInvoices = invoices
    .filter((inv) => {
      if (filter === 'all') return true;
      return inv.riskTier === filter;
    })
    .filter((inv) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        inv.customerName.toLowerCase().includes(s) ||
        inv.city.toLowerCase().includes(s) ||
        inv.invoiceNumber.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'delay') return b.predictedDelayDays - a.predictedDelayDays;
      if (sortBy === 'amount') return b.amount - a.amount;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EC] p-8 flex items-center justify-center font-mono text-sm text-ink-muted">
        Loading receivables ledger...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-ink-primary paper-texture py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ink-primary">
              {t('receivables.title')}
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              {t('receivables.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-ink-muted">
              Total Receivables:
            </span>
            <span className="font-serif text-xl font-bold text-ink-primary">
              <TabularMoney amount={invoices.reduce((acc, curr) => acc + curr.amount, 0)} format="detail" />
            </span>
          </div>
        </div>

        {/* SEARCH & FILTERS STRIP */}
        <div className="bg-paper-card border border-paper-line rounded-[3px] p-4 shadow-ledger flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                filter === 'all'
                  ? 'bg-ink-primary text-paper-bg'
                  : 'bg-white text-ink-muted hover:text-ink-primary border border-paper-line'
              }`}
            >
              {t('receivables.filterAll')}
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                filter === 'critical'
                  ? 'bg-brick-danger text-white'
                  : 'bg-white text-brick-danger hover:bg-brick-tint border border-brick-border'
              }`}
            >
              {t('receivables.filterCritical')}
            </button>
            <button
              onClick={() => setFilter('moderate')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                filter === 'moderate'
                  ? 'bg-amber-700 text-white'
                  : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-300'
              }`}
            >
              {t('receivables.filterModerate')}
            </button>
            <button
              onClick={() => setFilter('safe')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                filter === 'safe'
                  ? 'bg-teal-safe text-white'
                  : 'bg-white text-teal-safe hover:bg-teal-tint border border-teal-border'
              }`}
            >
              {t('receivables.filterSafe')}
            </button>
          </div>

          {/* Search Input & Sort Selector */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-ink-muted" />
              <input
                type="text"
                placeholder="Search party or invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-paper-line rounded focus:outline-none focus:ring-1 focus:ring-saffron text-ink-primary placeholder:text-ink-muted/70"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-1.5 px-2 bg-white border border-paper-line rounded text-ink-primary focus:outline-none"
            >
              <option value="delay">Sort: Delay Days</option>
              <option value="amount">Sort: Amount</option>
              <option value="dueDate">Sort: Due Date</option>
            </select>
          </div>
        </div>

        {/* INVOICE TABLE (Ruled Ledger Rows) */}
        <div className="bg-[#FAF7F0] border border-paper-line rounded-[4px] shadow-ledger overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-paper-subtle/80 border-b border-paper-ruled font-mono text-[11px] text-ink-muted uppercase">
                  <th className="py-3 px-4 font-bold">{t('receivables.table.invoiceNo')}</th>
                  <th className="py-3 px-4 font-bold">{t('receivables.table.customer')}</th>
                  <th className="py-3 px-4 font-bold text-right">{t('receivables.table.amount')}</th>
                  <th className="py-3 px-4 font-bold">{t('receivables.table.dueDate')}</th>
                  <th className="py-3 px-4 font-bold">{t('receivables.table.predictedDate')}</th>
                  <th className="py-3 px-4 font-bold">{t('receivables.table.historicalLag')}</th>
                  <th className="py-3 px-4 font-bold">{t('receivables.table.riskStamp')}</th>
                  <th className="py-3 px-4 font-bold text-right">{t('receivables.table.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-line font-sans">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className={`hover:bg-paper-card/70 transition-colors ${
                      inv.linkedToBridgeOffer ? 'bg-saffron-tint/60 border-l-4 border-l-saffron' : ''
                    }`}
                  >
                    {/* Invoice Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-ink-primary whitespace-nowrap">
                      {inv.invoiceNumber}
                      {inv.linkedToBridgeOffer && (
                        <span className="block text-[9px] font-sans font-bold text-saffron uppercase">
                          ★ {t('receivables.linkedBadge')}
                        </span>
                      )}
                    </td>

                    {/* Customer & City */}
                    <td className="py-3.5 px-4 font-medium text-ink-primary">
                      <div className="font-bold text-ink-primary">{inv.customerName}</div>
                      <div className="text-[11px] text-ink-muted font-mono">{inv.city}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-serif font-black text-sm text-ink-primary whitespace-nowrap">
                      <TabularMoney amount={inv.amount} format="detail" />
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 font-mono text-ink-secondary whitespace-nowrap">
                      {formatDateShort(inv.dueDate)}
                    </td>

                    {/* Predicted Pay Date */}
                    <td className="py-3.5 px-4 font-mono font-bold text-ink-primary whitespace-nowrap">
                      {formatDateShort(inv.predictedPayDate)}
                    </td>

                    {/* Historical Lag */}
                    <td className="py-3.5 px-4 font-mono text-ink-muted whitespace-nowrap">
                      avg {inv.historicalAvgDelay} days late
                    </td>

                    {/* Risk Stamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {inv.riskTier === 'critical' && (
                        <StampTag label={`+${inv.predictedDelayDays}D LATE`} variant="critical" size="sm" />
                      )}
                      {inv.riskTier === 'moderate' && (
                        <StampTag label={`+${inv.predictedDelayDays}D LATE`} variant="warning" size="sm" />
                      )}
                      {inv.riskTier === 'safe' && (
                        <StampTag label="ON TIME" variant="safe" size="sm" />
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {inv.linkedToBridgeOffer ? (
                        <LedgerButton
                          variant="saffron"
                          size="sm"
                          onClick={() => navigate('/loan')}
                        >
                          Bridge Loan →
                        </LedgerButton>
                      ) : (
                        <button
                          onClick={() => navigate('/alert')}
                          className="text-ink-muted hover:text-ink-primary font-mono text-xs underline"
                        >
                          Analyze
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
