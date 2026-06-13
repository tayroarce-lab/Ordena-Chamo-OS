import React from 'react';

import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: string | number;
  badge?: { text: string; color: 'positive' | 'neutral' | 'warning' | 'negative' };
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

const hoverVariants = {
  hover: { scale: 1.015, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
};

export function KpiCard({ title, value, badge, icon, footer }: KpiCardProps) {
  return (
    <motion.div
      className="rounded-xl border border-border p-4 bg-bg-card"
      variants={hoverVariants}
      whileHover="hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-text-muted font-medium">
            {title}
          </h3>
        </div>
        {icon && <div className="text-accent-gold">{icon}</div>}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-text-primary">
            {value}
          </p>
          {badge && (
            <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
              badge.color === 'positive'
                ? 'text-accent-gold bg-yellow-900/20 border border-accent-gold/30'
                : (badge.color === 'warning' || badge.color === 'negative')
                  ? 'text-red-400 bg-red-900/20 border border-red-400/30'
                  : 'text-gray-400 bg-gray-900/20 border border-gray-400/30'
            }`}>
              {badge.text}
            </div>
          )}
        </div>
      </div>

      {footer && (
        <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
