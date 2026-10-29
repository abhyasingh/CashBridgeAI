import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';
import { 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Coins, 
  Database, 
  Sparkles,
  Layers
} from 'lucide-react';

interface HeaderProps {
  onOpenAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAssistant }) => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav.home'), icon: Layers },
    { to: '/dashboard', label: t('nav.dashboard'), icon: TrendingUp },
    { to: '/alert', label: t('nav.alert'), icon: AlertTriangle, hasAlert: true },
    { to: '/receivables', label: t('nav.receivables'), icon: FileText },
    { to: '/loan', label: t('nav.loan'), icon: Coins },
    { to: '/connect', label: t('nav.connect'), icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F4EC]/95 backdrop-blur-md border-b border-paper-ruled transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-[3px] bg-ink-primary flex items-center justify-center text-paper-bg shadow-sm group-hover:bg-black transition-colors">
                <span className="font-serif font-black text-lg text-saffron leading-none">CB</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-ink-primary leading-tight">
                  CashBridge<span className="text-saffron">.ai</span>
                </span>
                <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                  बही-खाता • Ledger AI
                </span>
              </div>
            </Link>

            {/* Active Business Context Stamp */}
            <div className="hidden xl:flex items-center px-2.5 py-1 rounded border border-paper-line bg-paper-subtle text-xs text-ink-secondary">
              <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2 animate-pulse" />
              <span className="font-semibold text-ink-primary">Sharma Garments</span>
              <span className="mx-1.5 text-ink-faint">|</span>
              <span className="text-ink-muted">Lucknow</span>
              <span className="ml-2 text-[10px] bg-paper-ruled px-1.5 py-0.2 rounded text-ink-secondary font-mono">
                Tally Live
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-3 py-1.5 text-xs lg:text-sm font-semibold rounded-[3px] transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-paper-subtle text-ink-primary border border-paper-line shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                        : 'text-ink-muted hover:text-ink-primary hover:bg-paper-subtle/50'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.hasAlert && (
                    <span className="w-2 h-2 rounded-full bg-brick-danger shrink-0" title="Deficit Alert" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Utility Actions */}
          <div className="flex items-center space-x-3">
            {onOpenAssistant && (
              <button
                type="button"
                onClick={onOpenAssistant}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-bold bg-saffron-tint border border-saffron-border text-saffron hover:bg-saffron hover:text-white transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('assistant.buttonLabel')}</span>
              </button>
            )}

            {/* Language Switcher EN | हिं */}
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
