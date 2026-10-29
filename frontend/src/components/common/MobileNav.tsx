import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, AlertTriangle, FileText, Coins, Database } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { t } = useTranslation();

  const mobileTabs = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: TrendingUp },
    { to: '/alert', label: t('nav.alert'), icon: AlertTriangle, hasAlert: true },
    { to: '/receivables', label: t('nav.receivables'), icon: FileText },
    { to: '/loan', label: t('nav.loan'), icon: Coins },
    { to: '/connect', label: t('nav.connect'), icon: Database },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F7F4EC]/95 backdrop-blur-md border-t border-paper-ruled px-2 py-1 shadow-lg"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-bold rounded relative transition-colors ${
                  isActive
                    ? 'text-saffron'
                    : 'text-ink-muted hover:text-ink-primary'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {tab.hasAlert && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brick-danger" />
                )}
              </div>
              <span className="truncate max-w-[64px]">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
