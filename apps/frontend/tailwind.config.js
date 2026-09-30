/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          darkRed: '#B81D24',
          black: '#141414',
          darkGray: '#181818',
          card: '#2F2F2F',
          lightGray: '#808080',
          textMuted: '#AAAAAA',
        },
      },
    },
  },
  plugins: [],
};
