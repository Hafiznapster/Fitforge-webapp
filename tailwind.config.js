/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sl: {
          blue: 'rgb(var(--theme-primary) / <alpha-value>)',
          'blue-dim': 'rgb(var(--theme-primary-dim) / <alpha-value>)',
          'blue-glow': 'var(--theme-primary-glow)',
          purple: '#9b6dff',
          'purple-dim': '#3d1a8a',
          gold: '#f0c040',
          'gold-dim': '#7a5a10',
          teal: '#30d5c8',
          red: '#ff4a6a',
          surface: '#0b0f1e',
          surface2: '#111827',
          border: 'rgba(74,158,255,0.2)',
          'border-strong': 'rgba(74,158,255,0.4)',
          'text-dim': '#6a7a9a',
          'text-mid': '#8a9ab8',
          bg: '#05070f'
        }
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        share: ['"Share Tech Mono"', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.25em',
      }
    },
  },
  plugins: [],
}
