import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { KhataAssistantModal } from './components/assistant/KhataAssistantModal';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AlertPage } from './pages/AlertPage';
import { ReceivablesPage } from './pages/ReceivablesPage';
import { LoanPage } from './pages/LoanPage';
import { ConnectPage } from './pages/ConnectPage';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './i18n';

export function App() {
  const { t } = useTranslation();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#F7F4EC] text-[#111A24]">
        {/* Top Header */}
        <Header onOpenAssistant={() => setIsAssistantOpen(true)} />

        {/* Primary Content View */}
        <main className="flex-1 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/alert" element={<AlertPage />} />
            <Route path="/receivables" element={<ReceivablesPage />} />
            <Route path="/loan" element={<LoanPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Bottom Tab Navigation */}
        <MobileNav />

        {/* Floating Khata AI Assistant Trigger Button (Bottom Right) */}
        <button
          type="button"
          onClick={() => setIsAssistantOpen(true)}
          className="fixed right-4 bottom-20 md:bottom-6 z-40 bg-saffron text-white hover:bg-saffron-hover px-3.5 py-2.5 rounded-full shadow-lg border-2 border-[#C25613] flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95"
          aria-label={t('assistant.buttonLabel')}
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span className="text-xs font-bold font-sans tracking-wide">
            {t('assistant.buttonLabel')}
          </span>
        </button>

        {/* Interactive Assistant Modal */}
        <KhataAssistantModal
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
