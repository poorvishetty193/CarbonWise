import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        forest: {
          50:  '#F2F6F4',
          55:  '#EEF4F0',
          100: '#E2ECE8',
          200: '#C5D9D2',
          300: '#A0C4B5',
          400: '#6E9E8A',
          500: '#3D7A62',
          600: '#2A5C47',
          700: '#1E4433',
          750: '#1A3B2C',
          800: '#142E22',
          900: '#0D2017',
          950: '#081510',
        },
        slateBlue: {
          50:  '#F5F7FA',
          100: '#E8EDF3',
          200: '#C9D5E2',
          300: '#A3B6C9',
          400: '#7595AF',
          500: '#4B6B88',
          550: '#3F5E79',
          600: '#34506A',
          700: '#2C4A60',
          800: '#1F3A4B',
          850: '#192F3D',
          900: '#122533',
          950: '#0C1B26',
        },
        amberAlert: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        earthGold: {
          DEFAULT: '#D4AF37',
          light: '#E8CC6E',
          dark: '#A88B28',
        },
        surface: {
          soft:   '#F9F9FB',
          card:   '#FFFFFF',
          border: '#EBEFF2',
        },
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.5s ease-out forwards',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in':    'scaleIn 0.3s ease-out forwards',
        'spin-slow':   'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideRight: {
          '0%':   { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
      boxShadow: {
        card:    '0 1px 4px rgba(13,32,23,0.06), 0 4px 16px rgba(13,32,23,0.04)',
        'card-hover': '0 4px 12px rgba(13,32,23,0.10), 0 8px 32px rgba(13,32,23,0.07)',
        glow:    '0 0 24px rgba(42,92,71,0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
