/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        navy: {
          950: '#0a1628',
          900: '#111d35',
          800: '#162040',
          700: '#1e3058',
          600: '#243a6d',
        }
      }
    },
  },
  plugins: [],
}

