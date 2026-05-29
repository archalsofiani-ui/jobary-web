import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        jobary: {
          blue:  '#1F5C99',
          light: '#D6E8F7',
          dark:  '#1A1A2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Arabic', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
};

export default config;
