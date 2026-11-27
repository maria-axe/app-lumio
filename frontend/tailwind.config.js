/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.25rem' }], // 13px — menor texto do app
      },
      colors: {
        duo: {
          // tons escuros o suficiente para texto branco em cima (>= 4,5:1)
          green: '#357A00',
          'green-dark': '#58A700',
          blue: '#0B6FA8',
          'blue-dark': '#1899D6',
          red: '#C72222',
          yellow: '#FFC800',
          text: '#3C3C3C',
          border: '#E5E5E5',
          bg: '#F7F7F7',
          'bg-dark': '#131F24',
          'surface-dark': '#1F2A30',
          'border-dark': '#37464F',
          'text-dark': '#F1F7FB',
        },
      },
    },
  },
  plugins: [],
};
