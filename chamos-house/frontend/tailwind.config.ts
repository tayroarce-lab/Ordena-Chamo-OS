import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
