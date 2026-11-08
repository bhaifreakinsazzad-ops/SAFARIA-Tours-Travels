import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#041713",
          100: "#062b27",
          200: "#0b352a",
          input: "#051f19",
          footer: "#03130f",
        },
        safaria: {
          emerald: "#064e3b",
          emeraldDark: "#042f24",
          navy: "#10243a",
          navyDark: "#091522",
          gold: "#d6b779",
          goldHi: "#f0d6a1",
          goldLo: "#cbaa6a",
          onGold: "#092720",
          ivory: "#f8f5ec",
          ink: "#f8f5ec",
          inkMuted: "#b1c3bc",
          inkFaint: "#9caf9f",
          line: "rgba(207,181,124,0.28)",
          lineStrong: "rgba(207,181,124,0.5)",
          focus: "#f1cf8e",
          success: "#7fd4a8",
          danger: "#f2a07b",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Playfair Display", "Georgia", "serif"],
        sans: ["Inter", '"Noto Sans Bengali"', '"Hind Siliguri"', "system-ui", "sans-serif"],
        bengali: ['"Noto Sans Bengali"', '"Hind Siliguri"', "Inter", "sans-serif"],
      },
      borderRadius: {
        btn: "7px",
        pill: "30px",
      },
      boxShadow: {
        btn: "0 3px 20px rgba(0,0,0,0.133)",
        btnHover: "0 4px 28px rgba(210,183,125,0.22)",
        header: "0 6px 30px rgba(0,0,0,0.2)",
        panel: "0 20px 50px rgba(0,0,0,0.133)",
        menu: "0 16px 40px rgba(0,0,0,0.333)",
      },
      maxWidth: {
        wrap: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
