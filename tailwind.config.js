/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#05130d',
        forest: {
          950: '#030c08',
          900: '#06150f',
          850: '#0a2016',
          800: '#0f2c1f',
          700: '#16432f',
          600: '#1e5c41',
          500: '#10b981',
          400: '#34d399',
          300: '#6ee7b7',
          200: '#a7f3d0',
        },
        surface: {
          DEFAULT: '#0a1d15',
          dark: '#05130d',
          glass: 'rgba(10, 29, 21, 0.82)',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        violet: {
          badge: '#8b5cf6',
          glow: 'rgba(139, 92, 246, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-bounce': 'glowBounce 2s ease-in-out infinite',
      },
      keyframes: {
        glowBounce: {
          '0%, 100%': { transform: 'translateY(0)', filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))' },
          '50%': { transform: 'translateY(-4px)', filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.9))' },
        }
      },
      zIndex: {
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [],
};
