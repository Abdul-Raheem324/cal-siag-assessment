/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"Fira Code"', '"Courier New"', 'monospace'],
      },
      colors: {
        // Base surfaces
        base:    '#090b0e',
        surface: '#0d1117',
        border:  '#1a1f26',
        // Text scale
        muted:   '#2d3748',
        dim:     '#4a5568',
        mid:     '#718096',
        bright:  '#e2e8f0',
        // Domain/status
        threat:  {
          red:    '#ef4444',
          orange: '#f97316',
          amber:  '#eab308',
          green:  '#22c55e',
        },
        domain: {
          military:     '#ef4444',
          political:    '#3b82f6',
          humanitarian: '#22c55e',
          economic:     '#8b5cf6',
          cyber:        '#06b6d4',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink':      'blink 1.6s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.15' },
        },
      },
    },
  },
  plugins: [],
}