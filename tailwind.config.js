/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          light: '#1a1a1a',
          hover: '#333333',
        },
        accent: {
          DEFAULT: '#000000',
          hover: '#1a1a1a',
        },
        success: '#10B981',
        surface: '#F8F9FA',
        'surface-hover': '#F1F3F5',
        border: '#E5E7EB',
        'border-light': '#F0F0F0',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 12px 24px rgba(0, 0, 0, 0.1)',
        'xl': '0 24px 48px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
