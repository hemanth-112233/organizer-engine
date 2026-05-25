module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#8b5cf6'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
