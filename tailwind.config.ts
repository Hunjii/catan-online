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
        },
      },
      fontFamily: {
        catan: ["var(--font-cinzel)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
