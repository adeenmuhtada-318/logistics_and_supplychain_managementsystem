/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#1F7A63',
          600: '#186350',
          700: '#115e4a',
          800: '#0d4f3e',
          900: '#064e3b',
          950: '#022c22',
        },
        navy: {
          50:  '#e6edf4',
          100: '#c2d2e3',
          200: '#8ba8c6',
          300: '#5580a6',
          400: '#2d5a85',
          500: '#163d60',
          600: '#0D253A',
          700: '#081C2D',
          800: '#061621',
          900: '#040f18',
          950: '#020810',
        },
        surface: {
          light: '#F5F7FA',
          card:  '#FFFFFF',
          muted: '#F1F5F9',
        },
        coolgray: {
          DEFAULT: '#9AA3A8',
          50:  '#f8fafb',
          100: '#f1f4f5',
          200: '#e2e7e9',
          300: '#c9d1d4',
          400: '#9AA3A8',
          500: '#6b7a80',
          600: '#556268',
          700: '#434f54',
          800: '#364045',
          900: '#2c3538',
          950: '#1a2124',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
