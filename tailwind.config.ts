import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TravelStore Turkey brand palette
        terracotta: {
          DEFAULT: '#C75B39',
          dark: '#A8482B',
          light: '#F6E3DA',
        },
        navy: {
          DEFAULT: '#123C55',
          dark: '#082F45',
        },
        navyDark: '#082F45',
        cream: '#F7F1E8',
        gold: '#C9A24D',
        borderSoft: '#E7DCCF',
        textMain: '#102A33',
        textMuted: '#64748B',
        whatsapp: '#25D366',

        // Existing semantic tokens remapped onto the Turkey palette so the whole
        // copied site inherits the warm heritage look without rewriting every component.
        primary: {
          DEFAULT: '#C75B39', // terracotta — CTAs, active nav, price highlights
          dark: '#A8482B',
          light: '#F6E3DA',
        },
        secondary: {
          DEFAULT: '#123C55', // deep navy — headings, dark sections
          blue: '#082F45',
          light: '#1B4E6B',
        },
        background: {
          light: '#F7F1E8', // warm cream page background
          dark: '#082F45',
        },
        surface: {
          grey: '#FBF7F0',
        },
        sidebar: {
          bg: '#082F45',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        serif: ['var(--font-display)', 'Playfair Display', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(18,60,85,0.08)',
        'card-hover': '0 8px 20px rgba(18,60,85,0.14)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
