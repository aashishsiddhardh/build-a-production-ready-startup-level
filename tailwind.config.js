/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f2',
          100: '#e5ecdf',
          200: '#cbd9c1',
          300: '#a7bf98',
          400: '#82a06d',
          500: '#63834e',
          600: '#4c683c',
          700: '#3d5331',
          800: '#33442a',
          900: '#2b3a25',
          950: '#151f12',
        },
        turmeric: {
          50: '#fdf8ed',
          100: '#f8ebcc',
          200: '#f0d494',
          300: '#e8b95c',
          400: '#e2a238',
          500: '#d9861f',
          600: '#c06718',
          700: '#a04c18',
          800: '#833d1a',
          900: '#6c3319',
          950: '#3d1a0a',
        },
        clay: {
          50: '#faf6f3',
          100: '#f3e8e0',
          200: '#e6cfc0',
          300: '#d6b099',
          400: '#c48d6f',
          500: '#b6735a',
          600: '#a85e4d',
          700: '#8c4b41',
          800: '#734039',
          900: '#603832',
          950: '#331b18',
        },
        ink: {
          50: '#f6f6f5',
          100: '#e7e7e4',
          200: '#d1d1cb',
          300: '#b0b1a7',
          400: '#88897c',
          500: '#6d6e62',
          600: '#57584e',
          700: '#474840',
          800: '#3c3c37',
          900: '#353531',
          950: '#1a1a17',
        },
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(43, 58, 37, 0.08), 0 4px 24px -4px rgba(43, 58, 37, 0.10)',
        card: '0 1px 2px rgba(43, 58, 37, 0.04), 0 8px 32px -12px rgba(43, 58, 37, 0.14)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
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
};
