import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Core Design Tokens ──────────────────────────────────────────
        primary: '#0D0D0D',
        surface: '#161616',
        elevated: '#1F1F1F',
        'border-subtle': '#2A2A2A',
        accent: '#F5A623',
        danger: '#E8442A',
        success: '#22C55E',
        info: '#3B82F6',
        muted: '#6B7280',
        'text-primary': '#F5F5F5',
        'text-secondary': '#9CA3AF',

        // ── Analytics Design System ──────────────────────────────────────
        // Backgrounds
        'bg-primary': '#0D0D0D',
        'bg-card': '#161616',
        'bg-card-alt': '#1c1c1c',

        // Text
        'text-muted': '#6B7280',

        // Borders
        border: '#2A2A2A',

        // Accent Gold (analytics / KPI)
        'accent-gold': '#F5A623',
        'accent-gold-2': '#d4891c',

        // Status
        'status-green': '#22C55E',
        'status-red': '#E8442A',

        // Category badges (productos vendidos)
        'cat-burger-bg': '#7f1d1d',
        'cat-burger-text': '#fca5a5',
        'cat-side-bg': '#14532d',
        'cat-side-text': '#86efac',
        'cat-drink-bg': '#1e3a5f',
        'cat-drink-text': '#93c5fd',
        'cat-combo-bg': '#431407',
        'cat-combo-text': '#fdba74',

        // Chart colors
        'chart-projected': '#4b3a1f',
        'chart-bar': '#5c3d0a',
        'chart-bar-bg': '#3d4575',
        'chart-delivery': '#3b82f6',
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        glow: '0 0 20px rgba(245, 166, 35, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
