/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lumora: {
          bg: '#05070B',
          card: '#0A1019',
          'card-hover': '#0F172A',
          glass: 'rgba(255, 255, 255, 0.04)',
          'glass-border': 'rgba(255, 255, 255, 0.08)',
          'glass-glow': 'rgba(59, 130, 246, 0.15)',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          green: '#22C55E',
          text: '#F8FAFC',
          muted: '#94A3B8',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 3s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'border-spin': 'borderSpin 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(6, 182, 212, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        borderSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      boxShadow: {
        'glass-glow': '0 0 25px -5px rgba(59, 130, 246, 0.25), 0 0 10px -5px rgba(6, 182, 212, 0.2)',
        'luxury': '0 20px 50px rgba(0, 0, 0, 0.6)',
        'accent-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'accent-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        'accent-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
      }
    },
  },
  plugins: [],
}
