/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stellar: {
          dark: '#0B0E17',
          card: '#151A28',
          accent: '#7B2CBF',
          cyan: '#00F5D4',
          gold: '#FFB703'
        }
      }
    },
  },
  plugins: [],
}
