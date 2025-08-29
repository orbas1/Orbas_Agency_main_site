module.exports = {
  content: ["./OrbusLanding/**/*.html", "./OrbusLanding/**/*.js"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        'orbas-blue': '#3b82f6',
        'orbas-dark-blue': '#1e40af',
        'orbas-light-blue': '#60a5fa',
        'orbas-orange': '#f97316',
        'orbas-green': '#10b981',
        'orbas-purple': '#8b5cf6',
        'orbas-pink': '#ec4899',
        'orbas-cream': '#fef3c7'
      }
    }
  },
  plugins: []
};
