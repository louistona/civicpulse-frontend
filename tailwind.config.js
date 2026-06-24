/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:      '#1A7A4A',
        'primary-dk': '#145E38',
        danger:       '#D9534F',
        warning:      '#E89B2F',
        surface:      '#FFFFFF',
        bg:           '#F7F8F5',
        'text-main':  '#1A1A2E',
        'text-muted': '#6B7280',
        border:       '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};