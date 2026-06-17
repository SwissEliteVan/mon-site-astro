import defaultTheme from 'tailwindcss/defaultTheme'
import animate from 'tailwindcss-animated'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Charte graphique CLICOM ───────────────────────────────
      colors: {
        // Couleur principale : vert lime Clicom
        lime: {
          DEFAULT:  '#B9FF66',
          hover:    '#A3E655',
          muted:    'rgba(185,255,102,0.08)',
          'muted-2': 'rgba(185,255,102,0.15)',
        },
        // Fonds sombres
        brand: {
          dark:   '#191A23',
          'dark-2': '#1f202b',
          'dark-3': '#2a2b38',
        },
        // Bordures
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong:  'rgba(255,255,255,0.16)',
          lime:    'rgba(185,255,102,0.25)',
        },
      },

      // ─── Typographie ───────────────────────────────────────────
      fontFamily: {
        // Inter pour le body (chargé via Google Fonts dans Layout.astro)
        sans:    ['Inter', ...defaultTheme.fontFamily.sans],
        // Montserrat pour les titres
        heading: ['Montserrat', ...defaultTheme.fontFamily.sans],
      },

      // ─── Tailles de texte ──────────────────────────────────────
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        hero:  ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1' }],
      },

      // ─── Border radius ─────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ─── Spacing sémantique ────────────────────────────────────
      spacing: {
        section: '6rem',
        inner:   '3rem',
      },

      // ─── Ombres Clicom ─────────────────────────────────────────
      boxShadow: {
        lime:       '0 0 24px rgba(185,255,102,0.18), 0 4px 16px rgba(0,0,0,0.4)',
        'lime-lg':  '0 0 48px rgba(185,255,102,0.28), 0 8px 32px rgba(0,0,0,0.5)',
        glass:      '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      // ─── Backdrop blur ─────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
      },
    },
  },

  plugins: [
    animate,

    // Utilitaire glassmorphism Clicom
    ({ addUtilities }) => addUtilities({
      '.glass': {
        background:                  'rgba(25, 26, 35, 0.85)',
        'backdrop-filter':           'blur(20px) saturate(180%)',
        '-webkit-backdrop-filter':   'blur(20px) saturate(180%)',
        border:                      '1px solid rgba(255,255,255,0.08)',
      },
      '.glass-lime': {
        background:                  'rgba(14, 20, 10, 0.92)',
        'backdrop-filter':           'blur(20px) saturate(180%)',
        '-webkit-backdrop-filter':   'blur(20px) saturate(180%)',
        border:                      '1px solid rgba(185,255,102,0.22)',
      },
      '.text-gradient-lime': {
        background:                  'linear-gradient(135deg, #B9FF66 0%, #78ff00 100%)',
        '-webkit-background-clip':   'text',
        '-webkit-text-fill-color':   'transparent',
        'background-clip':           'text',
      },
    }),
  ],
}