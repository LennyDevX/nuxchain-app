import { Config } from 'tailwindcss';

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Brand Color Palette
        brand: {
          black: {
            50: '#f8f8f8',
            100: '#e5e5e5',
            200: '#cccccc',
            300: '#999999',
            400: '#666666',
            500: '#333333',
            600: '#1a1a1a',
            700: '#0f0f0f',
            800: '#0a0a0a',
            900: '#050505',
            DEFAULT: '#0a0a0a',
          },
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
            DEFAULT: '#8b5cf6',
          },
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            DEFAULT: '#ef4444',
          },
          white: {
            50: '#ffffff',
            100: '#fefefe',
            200: '#fdfdfd',
            300: '#fcfcfc',
            400: '#fafafa',
            500: '#f8fafc',
            600: '#f1f5f9',
            700: '#e2e8f0',
            800: '#cbd5e1',
            900: '#94a3b8',
            DEFAULT: '#ffffff',
          },
        },
        // Legacy colors for compatibility
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          DEFAULT: '#8b5cf6',
        },
        secondary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Fira Code', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%': { transform: 'none', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'bounce-slow': 'bounce-slow 1s infinite',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
        'gradient-flow': 'gradient-flow 8s ease infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0a0a0a 0%, #5b21b6 50%, #dc2626 100%)',
        'gradient-secondary': 'linear-gradient(45deg, #8b5cf6 0%, #ef4444 50%, #ffffff 100%)',
        'gradient-accent': 'linear-gradient(90deg, #1a1a1a 0%, #5b21b6 25%, #8b5cf6 50%, #ef4444 75%, #dc2626 100%)',
        'gradient-radial': 'radial-gradient(circle, #5b21b6 0%, #0a0a0a 70%)',
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
};
