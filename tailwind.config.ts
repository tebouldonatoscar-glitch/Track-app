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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Neutral scale re-tuned to a true-black iOS surface system
        // (systemBackground / secondarySystemBackground / separator, etc.)
        // instead of Tailwind's default blue-grey slate.
        slate: {
          50: "#FFFFFF",
          100: "#F5F5F7",
          200: "#E4E4E7",
          300: "#C7C7CC",
          400: "#9A9A9E",
          500: "#79797E",
          600: "#48484A",
          700: "#2C2C2E",
          800: "#1C1C1E",
          900: "#131314",
          950: "#000000",
        },
        // Apple's actual systemGreen (dark mode), standing in for the
        // default Tailwind green - reads as native iOS rather than a
        // custom brand color.
        green: {
          100: "#D8FFE3",
          400: "#30D158",
          500: "#30D158",
          600: "#32D74B",
          700: "#248A3D",
        },
      },
    },
  },
  plugins: [],
};
export default config;
