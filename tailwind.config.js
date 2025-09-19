/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors
        primary: '#0F766E',
        primaryHover: '#115E59',
        accent: '#10B981',
        surface: '#F8FAF9',
        border: '#E5E7EB',
        ink: '#0B1320',
        ink2: '#475569',
        success: '#059669',
        warning: '#D97706',
        danger: '#DC2626',
        
        // Legacy colors for backward compatibility
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      borderRadius: {
        md: '10px',
        lg: '12px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0,0,0,.04)',
      },
      fontFamily: {
        'thai': ['Sarabun', 'sans-serif'],
        'sans': ['Inter', 'Sarabun', 'sans-serif'],
      },
      animation: {
        'float': 'float 30s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'slideDown': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '33%': { transform: 'translate(20px, -20px) rotate(120deg)' },
          '66%': { transform: 'translate(-15px, 15px) rotate(240deg)' },
        },
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
