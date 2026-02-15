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
        },
        secondary: {
          DEFAULT: '#FFF6BF',
        },
        accent: {
          DEFAULT: '#F19ED2',
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
    },
  },
  plugins: [],
} satisfies Config;
