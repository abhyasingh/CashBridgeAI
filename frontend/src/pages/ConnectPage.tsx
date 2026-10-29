import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RefreshCw, 
  ArrowRight
} from 'lucide-react';
import { LedgerButton } from '../components/common/LedgerButton';
import { StampTag } from '../components/common/StampTag';

interface SourceCard {
  id: string;
  name: string;
  category: string;
  descriptionKey: string;
  status: 'connected' | 'disconnected';
  lastSync?: string;
  recordsCount?: string;
}

export const ConnectPage: React.FC = () => {
  const { t } = useTranslation();

  const [sources, setSources] = useState<SourceCard[]>([
    {
      id: 'tally',
      name: 'Tally Prime 4.1',
      category: 'Accounting Software',
      descriptionKey: 'connect.tallyDesc',
      status: 'connected',
      lastSync: 'Today, 09:30 AM',
      recordsCount: '14 open invoices',
    },
    {
      id: 'aa',
      name: 'Account Aggregator (HDFC Current A/C)',
      category: 'RBI-Regulated Banking Consent',
      descriptionKey: 'connect.aaDesc',
      status: 'connected',
      lastSync: 'Today, 10:15 AM',
      recordsCount: '124 ledger transactions',
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      category: 'Cloud Accounting',
      descriptionKey: 'connect.quickbooksDesc',
      status: 'disconnected',
    },
    {
      id: 'csv',
      name: 'Upload Ledger CSV / Excel',
      category: 'Manual File Import',
      descriptionKey: 'connect.csvDesc',
      status: 'disconnected',
    },
  ]);

  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleSimulateConnect = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: 'connected', lastSync: 'Just now', recordsCount: '38 items synced' }
            : s
        )
      );
      setConnectingId(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-ink-primary paper-texture py-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ink-primary">
            {t('connect.title')}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {t('connect.subtitle')}
          </p>
        </div>

        {/* SOURCES GRID */}
        <div className="space-y-4">
          {sources.map((source) => {
            const isConnecting = connectingId === source.id;
            return (
              <div
                key={source.id}
                className="bg-paper-card border border-paper-line rounded-[4px] p-5 shadow-ledger flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="font-serif text-lg font-bold text-ink-primary">
                      {source.name}
                    </h3>
                    {source.status === 'connected' ? (
                      <StampTag label={t('connect.statusConnected')} variant="safe" size="sm" />
                    ) : (
                      <StampTag label={t('connect.statusDisconnected')} variant="neutral" size="sm" />
                    )}
                  </div>

                  <p className="text-xs text-ink-muted leading-relaxed font-sans">
                    {t(source.descriptionKey)}
                  </p>

                  {source.status === 'connected' && (
                    <div className="flex items-center space-x-3 text-[11px] font-mono text-ink-secondary pt-1">
                      <span>Last Synced: {source.lastSync}</span>
                      <span>•</span>
                      <span>{source.recordsCount}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center">
                  {source.status === 'connected' ? (
                    <LedgerButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleSimulateConnect(source.id)}
                      loading={isConnecting}
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      {t('connect.syncNow')}
                    </LedgerButton>
                  ) : (
                    <LedgerButton
                      variant="saffron"
                      size="sm"
                      onClick={() => handleSimulateConnect(source.id)}
                      loading={isConnecting}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                      iconPosition="right"
                    >
                      {isConnecting ? t('connect.simulating') : t('connect.connectBtn')}
                    </LedgerButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SECURITY & PRIVACY NOTE */}
        <div className="bg-[#FAF7F0] border border-paper-line rounded p-4 text-xs font-mono text-ink-muted space-y-1">
          <p className="font-bold text-ink-primary">Consent-Based Read-Only Encryption</p>
          <p>
            Bank statements accessed strictly via RBI-regulated Account Aggregators (Sahamati framework). CashBridge never stores your netbanking passwords or has debit permissions.
          </p>
        </div>
      </div>
    </div>
  );
};
