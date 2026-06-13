import clsx from 'clsx';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';

import { motion } from 'framer-motion';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={clsx('overflow-x-auto rounded-xl border border-border-subtle', className)}>
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border-subtle bg-elevated">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={clsx(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border-subtle bg-surface">{children}</tbody>;
}

interface MotionTableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  index?: number;
}

export const MotionTableRow = forwardRef<HTMLTableRowElement, MotionTableRowProps>(
  ({ children, onClick, className, index = 0, ...props }, ref) => {
    return (
      <motion.tr
        ref={ref}
        onClick={onClick}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        className={clsx(
          'transition-colors',
          onClick && 'cursor-pointer hover:bg-elevated',
          className,
        )}
        {...props}
      >
        {children}
      </motion.tr>
    );
  },
);
MotionTableRow.displayName = 'MotionTableRow';

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={clsx('px-4 py-3 text-text-primary', className)}>{children}</td>;
}
