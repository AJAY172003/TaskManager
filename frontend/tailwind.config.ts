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
        brand: {
          50: "#f0f4ff",
          100: "#dde5ff",
          200: "#c3d0ff",
          500: "#4f6ef7",
          600: "#3b5bf5",
          700: "#2a48e8",
          900: "#1a2f9e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
