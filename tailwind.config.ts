import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Duto Mint Clean Palette
        primary: {
          DEFAULT: '#7DE6C3',
          dark: '#4FD4A8',
          light: '#A8F0D9',
        },
        secondary: {
          DEFAULT: '#FFF6BF',
          dark: '#FFE88A',
        },
        accent: {
          DEFAULT: '#F19ED2',
          dark: '#E77FBF',
        },
        background: {
          DEFAULT: '#F7F9F2',
          surface: '#FFFFFF',
        },
        border: {
          DEFAULT: '#DCEEE7',
        },
        text: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
        },
        track: '#E5E7EB',

        // Legacy CSS variables (deprecated)
        foreground: "var(--foreground)",
      },
      zIndex: {
        'app-bar': '30',
        'nav': '20',
        'fab': '40',
        'modal': '50',
      },
      // Playful Gummy: Bounce Animations
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'jelly': {
          '0%, 100%': { transform: 'scale(1, 1)' },
          '25%': { transform: 'scale(1.05, 0.95)' },
          '50%': { transform: 'scale(0.95, 1.05)' },
          '75%': { transform: 'scale(1.02, 0.98)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
      },
      animation: {
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'jelly': 'jelly 0.6s ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      // Playful Gummy: Backdrop Blur for Glassmorphism
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;
