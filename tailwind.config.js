/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-primary': '#5B50D6',
        'app-bg': '#F5F6FF',
        'app-text': '#0D1340',
        'app-secondary': '#EEEDFD',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
