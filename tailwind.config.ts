import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors
        'alaga-blue': '#2546F0',
        'alaga-gold': '#FFD43B',
        'alaga-teal': '#00BF7D',
        'alaga-navy': '#1A1A40',
        'alaga-charcoal': '#2E2E2E',
        'alaga-gray': '#F5F5F5',
        
        // Light mode palette
        'light-bg': '#FFFFFF',
        'light-bg-secondary': '#F8F9FA',
        'light-text': '#1F2937',
        'light-text-secondary': '#6B7280',
        'light-border': '#E5E7EB',
        
        // Dark mode palette
        'dark-bg': '#0F172A',
        'dark-bg-secondary': '#1E293B',
        'dark-text': '#F1F5F9',
        'dark-text-secondary': '#CBD5E1',
        'dark-border': '#334155',
      },
      animation: {
        'shimmer': 'shimmer 3s linear infinite',
        'shimmer-fast': 'shimmer 1.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: [],
};

export default config;
