import animate from 'tailwindcss-animated'
import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5'
        },
        secondary: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669'
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706'
        },
        surface: {
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0'
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      spacing: {
        'section-gap': '6rem',
        'element-gap': '3rem',
        ...defaultTheme.spacing
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        heading: ['Space Grotesk', ...defaultTheme.fontFamily.sans]
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px'
      }
    },
  },
  plugins: [
    animate,
    ({ addUtilities }) => addUtilities({
      '.glass': {
        '@defaults backdrop-filter': {},
        'background': 'rgba(255, 255, 255, 0.1)',
        'backdrop-filter': 'blur(12px) saturate(160%)',
        '-webkit-backdrop-filter': 'blur(12px) saturate(160%)'
      }
    })
  ]
}