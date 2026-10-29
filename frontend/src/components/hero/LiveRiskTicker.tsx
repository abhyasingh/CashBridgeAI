import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio } from 'lucide-react';
import { mockLiveTicker } from '../../mocks/forecast.mock';
import { StampTag } from '../common/StampTag';

export const LiveRiskTicker: React.FC = () => {
  const { i18n } = useTranslation();
  const isHindi = i18n.language.startsWith('hi');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockLiveTicker.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const currentItem = mockLiveTicker[currentIndex];
  const message = isHindi ? currentItem.messageHi : currentItem.messageEn;

  return (
    <div className="w-full bg-paper-subtle/90 border border-paper-line rounded-[3px] px-3.5 py-2 flex items-center justify-between text-xs overflow-hidden shadow-2xs">
      <div className="flex items-center space-x-2.5 min-w-0">
        <span className="flex items-center text-saffron shrink-0 font-bold uppercase tracking-wider text-[10px]">
          <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse text-brick-danger" />
          <span className="hidden sm:inline">LIVE KHATA SIGNAL</span>
        </span>
        <span className="text-paper-ruled hidden sm:inline">|</span>
        <StampTag
          label={currentItem.timeLabel}
          variant={currentItem.severity === 'critical' ? 'critical' : currentItem.severity === 'warning' ? 'warning' : 'neutral'}
          size="sm"
          className="shrink-0"
        />
        <p className="text-ink-primary font-medium truncate select-none transition-all duration-300">
          {message}
        </p>
      </div>

      <div className="flex items-center space-x-1 shrink-0 ml-2">
        {mockLiveTicker.map((_, idx) => (
          <span
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-saffron w-3' : 'bg-paper-ruled'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
