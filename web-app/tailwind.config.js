/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#101412',
          low: '#181c1a',
          lowest: '#0b0f0d',
          container: '#1c211e',
          high: '#272b28',
          highest: '#313632',
        },
        primary: {
          DEFAULT: '#5dcaa5',
          dim: 'rgba(93,222,165,0.4)',
          faint: 'rgba(93,222,165,0.05)',
        },
        outline: {
          DEFAULT: '#8a938e',
          variant: '#404944',
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
