/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: '#F7F4EC',
          card: '#F0EAD9',
          subtle: '#E8E0CE',
          ruled: '#DCD2BD',
          line: '#D2C5AC',
        },
        ink: {
          primary: '#111A24',
          secondary: '#334155',
          muted: '#526071',
          faint: '#8E9AA8',
        },
        saffron: {
          DEFAULT: '#D9651C',
          hover: '#C25613',
          tint: '#FDF3EB',
          border: '#F4CBB2',
        },
        teal: {
          safe: '#1E6B5C',
          safeHover: '#175448',
          tint: '#EDF6F3',
          border: '#B6DDD4',
        },
        brick: {
          danger: '#B83227',
          dangerHover: '#9F2A20',
          tint: '#FDF0EE',
          border: '#F6C8C3',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Manrope"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', '"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        'ledger-sm': '0 1px 3px rgba(17, 26, 36, 0.05)',
        'ledger': '0 2px 6px -1px rgba(17, 26, 36, 0.08), 0 1px 4px -1px rgba(17, 26, 36, 0.04)',
        'ledger-lg': '0 10px 25px -5px rgba(17, 26, 36, 0.1), 0 8px 10px -6px rgba(17, 26, 36, 0.05)',
        'stamp': '1px 2px 0px rgba(17, 26, 36, 0.25)',
      },
      backgroundImage: {
        'ledger-lines': 'repeating-linear-gradient(transparent, transparent 31px, #E8E0CE 31px, #E8E0CE 32px)',
        'danger-hatch': 'repeating-linear-gradient(45deg, rgba(184, 50, 39, 0.06), rgba(184, 50, 39, 0.06) 8px, rgba(184, 50, 39, 0.14) 8px, rgba(184, 50, 39, 0.14) 16px)',
      },
    },
  },
  plugins: [],
}
