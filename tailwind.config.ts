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
        // Neon accent, standing in for the default Tailwind green - reads
        // as electric on the true-black background instead of muted.
        green: {
          100: "#D8FFE9",
          400: "#39FF8A",
          500: "#12E870",
          600: "#00D96A",
          700: "#00A855",
        },
      },
    },
  },
  plugins: [],
};
export default config;
