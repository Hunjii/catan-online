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
        catan: {
          wood: "#2E7D32",
          brick: "#C62828",
          sheep: "#8BC34A",
          wheat: "#FBC02D",
          ore: "#546E7A",
          desert: "#D7CCC8",
          ocean: "#0288D1",
          gold: "#FFB300",
          cardboard: "#EFEBE9",
          "dark-wood": "#3d2314",
          "light-wood": "#5c3a21",
          "parchment": "#f4e4bc",
          "gold-trim": "#bfa054"
        },
      },
      backgroundImage: {
        'wood-pattern': "url('/assets/wood-bg.jpg')",
        'dark-wood-pattern': "url('/assets/dark_wood_bg.jpg')",
        'parchment-pattern': "url('/assets/parchment-bg.jpg')",
      },
      boxShadow: {
        'inset-wood': 'inset 0 2px 10px rgba(0,0,0,0.8), 0 5px 15px rgba(0,0,0,0.5)',
        'btn-wood': '0 4px 6px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)',
        'btn-wood-active': '0 1px 2px rgba(0,0,0,0.5), inset 0 4px 6px rgba(0,0,0,0.6)',
      },
      fontFamily: {
        catan: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-be-vietnam)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
