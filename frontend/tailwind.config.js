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
        background: '#090b0f', // Very dark slate
        panel: '#0f131a', // Vercel-like dashboard panels
        borderDark: '#1e2633', // Custom borders
        accent: {
          primary: '#6366f1', // Indigo
          success: '#10b981', // Emerald
          warning: '#f59e0b', // Amber
          danger: '#ef4444', // Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        neon: '0 0 15px rgba(99, 102, 241, 0.15)',
      }
    },
  },
  plugins: [],
}
