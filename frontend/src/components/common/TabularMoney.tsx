import React from 'react';
import { formatCurrencyCompact, formatCurrencyDetail } from '../../utils/formatters';

interface TabularMoneyProps {
  amount: number;
  format?: 'compact' | 'detail';
  highlightSign?: boolean;
  className?: string;
  prefix?: string;
}

export const TabularMoney: React.FC<TabularMoneyProps> = ({
  amount,
  format = 'detail',
  highlightSign = false,
  className = '',
  prefix = '',
}) => {
  const formatted =
    format === 'compact' ? formatCurrencyCompact(amount) : formatCurrencyDetail(amount);

  let signColor = '';
  if (highlightSign) {
    if (amount < 0) signColor = 'text-brick-danger font-semibold';
    else if (amount > 0) signColor = 'text-teal-safe font-semibold';
  }

  return (
    <span className={`tabular-nums font-mono tracking-tight ${signColor} ${className}`}>
      {prefix}
      {formatted}
    </span>
  );
};
