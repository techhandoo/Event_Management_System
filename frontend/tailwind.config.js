/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef5ff',
          100: '#d9e8ff',
          200: '#bbdaff',
          300: '#8cc4ff',
          400: '#54a5ff',
          500: '#2b85ff',
          600: '#0070F3',
          700: '#005bcf',
          800: '#004aa8',
          900: '#003d85',
          950: '#002657',
        },
        surface: {
          0:    '#ffffff',
          25:   '#fcfcfd',
          50:   '#f9fafb',
          100:  '#f2f4f7',
          150:  '#eaecf0',
          200:  '#d0d5dd',
          300:  '#98a2b3',
          400:  '#667085',
          500:  '#475467',
          600:  '#344054',
          700:  '#1d2939',
          800:  '#101828',
          900:  '#0c111d',
          950:  '#060814',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        border:  '#eaecf0',
        input:   '#d0d5dd',
        ring:    '#0070F3',
        background: '#f9fafb',
        foreground: '#101828',
        primary: {
          DEFAULT: '#0070F3',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f2f4f7',
          foreground: '#667085',
        },
        accent: {
          DEFAULT: '#f2f4f7',
          foreground: '#101828',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#101828',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#101828',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        'xs':    '0 1px 2px 0 rgb(16 24 40 / 0.05)',
        'card':  '0 1px 3px 0 rgb(16 24 40 / 0.03), 0 1px 2px -1px rgb(16 24 40 / 0.03)',
        'card-hover': '0 4px 8px -2px rgb(16 24 40 / 0.06), 0 2px 4px -2px rgb(16 24 40 / 0.04)',
        'card-lg': '0 12px 16px -4px rgb(16 24 40 / 0.05), 0 4px 6px -2px rgb(16 24 40 / 0.03)',
        'sidebar': '1px 0 0 0 rgb(16 24 40 / 0.06)',
        'dropdown': '0 12px 16px -4px rgb(16 24 40 / 0.08), 0 4px 6px -2px rgb(16 24 40 / 0.03)',
        'focus':  '0 0 0 4px rgb(0 112 243 / 0.14)',
        'brand':  '0 1px 2px rgb(0 112 243 / 0.06)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
