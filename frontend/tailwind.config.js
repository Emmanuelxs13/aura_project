/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FEF3E2',
        secondary: '#FAB12F',
        accent: '#FA812F',
        danger: '#DD0303',
        'primary-dark': '#F5E6CC',
        'secondary-dark': '#D4940A',
        'accent-dark': '#D4650A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
