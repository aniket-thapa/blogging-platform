/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./views/**/*.ejs'],
  theme: {
    extend: {
      colors: {
        'gray-850': '#1f293740',
        'gray-250': '#e5e7eb70',
      },
    },
  },
  plugins: [],
};
