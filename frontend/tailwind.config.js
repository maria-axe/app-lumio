/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        duo: {
          green: '#58CC02',
          'green-dark': '#58A700',
          blue: '#1CB0F6',
          'blue-dark': '#1899D6',
          red: '#FF4B4B',
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
