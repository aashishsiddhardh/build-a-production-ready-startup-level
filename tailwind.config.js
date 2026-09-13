/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f3f7f2',
          100: '#e3ecdf',
          200: '#c7d9c0',
          300: '#a2bf97',
          400: '#79a06b',
          500: '#5a824c',
          600: '#45673a',
          700: '#385230',
          800: '#2f4229',
          900: '#283724',
          950: '#131e11',
        },
        turmeric: {
          50: '#fdf8ed',
          100: '#f9edcc',
          200: '#f2d894',
          300: '#ebbe5c',
          400: '#e5a534',
          500: '#dc8a1d',
          600: '#c26a16',
          700: '#a14e16',
          800: '#843e18',
          900: '#6d3417',
          950: '#3e1a09',
        },
        clay: {
          50: '#faf6f2',
          100: '#f2e9df',
          200: '#e4d1bf',
          300: '#d2b299',
          400: '#bd8f70',
          500: '#ad7657',
          600: '#9d634b',
          700: '#834f40',
          800: '#6b4238',
          900: '#583830',
          950: '#2f1c18',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'ui-serif', 'serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
