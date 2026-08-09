/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3B82F6',
          'blue-dark': '#2563EB',
          emerald: '#10B981',
          dark: '#0F172A',
          surface: '#1E293B',
          light: '#F8FAFC',
          border: '#E2E8F0',
          danger: '#EF4444',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0px 4px 20px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
      },
    },
  },
  plugins: [],
}