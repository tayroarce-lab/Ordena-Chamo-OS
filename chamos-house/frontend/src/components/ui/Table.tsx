import clsx from 'clsx';
import type { ReactNode } from 'react';

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

export function TableRow({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-elevated',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={clsx('px-4 py-3 text-text-primary', className)}>{children}</td>;
}
