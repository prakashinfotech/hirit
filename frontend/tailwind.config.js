/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#2563eb',
        'brand-primary-hover': '#1d4ed8',
        'brand-dark': '#1f2937',
        'brand-bg': '#f9fafb',
        // Legacy fallbacks
        'foundit-orange': '#2563eb',
        'foundit-navy': '#1f2937',
        'foundit-gray': '#f9fafb',
      },
    },
  },
  plugins: [],
}
