/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#13151A',
        sidebar: '#181A20',
        card: '#1F222A',
        primary: '#00E08F',
        'primary-dark': '#00B373',
        'primary-light': '#E6FDF4',
        'primary-bg': '#0D2B22',
        danger: '#FF4D4D',
        'danger-bg': '#331A1D',
        text: {
          main: '#FFFFFF',
          muted: '#8A8D93',
        },
        chart: {
          red: '#FF6B6B',
          purple: '#8B5CF6',
          orange: '#F59E0B',
          green: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
