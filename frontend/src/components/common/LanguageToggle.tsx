import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('hi') ? 'hi' : 'en';

  const toggleLanguage = (lang: 'en' | 'hi') => {
    if (currentLang !== lang) {
      i18n.changeLanguage(lang);
    }
  };

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded border border-paper-line bg-paper-subtle/80 ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <button
        type="button"
        onClick={() => toggleLanguage('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded transition-colors duration-150 ${
          currentLang === 'en'
            ? 'bg-ink-primary text-paper-bg shadow-sm'
            : 'text-ink-muted hover:text-ink-primary'
        }`}
        aria-pressed={currentLang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage('hi')}
        className={`px-2.5 py-1 text-xs font-bold rounded transition-colors duration-150 font-hindi ${
          currentLang === 'hi'
            ? 'bg-ink-primary text-paper-bg shadow-sm'
            : 'text-ink-muted hover:text-ink-primary'
        }`}
        aria-pressed={currentLang === 'hi'}
      >
        हिं
      </button>
    </div>
  );
};
