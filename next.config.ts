import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7cc8fb',
          400: '#38a9f6',
          500: '#0e8ce2',
          600: '#026fc7',
          700: '#0358a1',
          800: '#074b85',
          900: '#0c406e',
          950: '#082949',
        },
        accent: {
          50: '#fdf2f2',
          100: '#fbe4e4',
          200: '#f7cece',
          300: '#f1abab',
          400: '#e77b7b',
          500: '#da5252',
          600: '#c53a3a',
          700: '#a52d2d',
          800: '#892929',
          900: '#722626',
          950: '#3e1010',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
export default config;
