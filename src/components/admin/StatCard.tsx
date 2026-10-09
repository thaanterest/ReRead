import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  subtitle?: string;
  badgeText?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  subtitle,
  badgeText,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-bg-main border border-border-main rounded-md p-5 flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-accent hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs uppercase tracking-wider text-text-main/60 font-sans font-medium">
          {title}
        </span>
        <div className="w-9 h-9 rounded-md bg-bg-secondary flex items-center justify-center text-accent flex-shrink-0 border border-border-main/50">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="font-heading text-3xl font-semibold text-text-main">
          {value}
        </span>
        {badgeText && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-sm bg-warning/15 text-warning border border-warning/30">
            {badgeText}
          </span>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-3 pt-3 border-t border-border-main/60 flex items-center justify-between text-xs font-sans">
          {change && (
            <div
              className={`flex items-center gap-1 font-medium ${
                trend === 'up'
                  ? 'text-accent'
                  : trend === 'down'
                  ? 'text-warning'
                  : 'text-text-main/60'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span>{change}</span>
            </div>
          )}
          {subtitle && (
            <span className="text-text-main/50 ml-auto">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
