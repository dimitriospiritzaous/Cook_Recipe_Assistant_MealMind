import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#fef8f5',
        'surface-low': '#f8f2f0',
        'surface-mid': '#f2edea',
        'surface-high': '#ede7e4',
        'surface-paper': '#ffffff',
        primary: '#8f4e00',
        'primary-container': '#ff9f43',
        'on-primary': '#ffffff',
        'on-surface': '#1d1b1a',
        'on-surface-variant': '#544437',
        secondary: '#566342',
        'secondary-container': '#d7e5bb',
        'on-secondary-container': '#5a6745',
        outline: '#877365',
        'outline-variant': '#dac2b1',
        tertiary: '#665e49',
        error: '#ba1a1a',
      },
      fontFamily: {
        display: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        body: ['var(--font-be-vietnam)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        editorial: '-0.02em',
      },
      boxShadow: {
        ambient: '0 12px 40px rgba(29, 27, 26, 0.06)',
        glow: '0 8px 32px rgba(143, 78, 0, 0.18)',
        lift: '0 24px 48px rgba(29, 27, 26, 0.08), 0 8px 16px rgba(143, 78, 0, 0.06)',
        ring: '0 0 0 1px rgba(218, 194, 177, 0.5), 0 20px 50px rgba(143, 78, 0, 0.12)',
      },
      borderRadius: {
        card: '1.25rem',
        pill: '9999px',
      },
      maxWidth: {
        content: '72rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        float: 'float 7s ease-in-out infinite',
        shine: 'shine 0.85s ease-out',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      backgroundSize: {
        '300%': '300% 300%',
      },
    },
  },
  plugins: [],
};

export default config;
