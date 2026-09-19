import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
      },
      colors: {
        ink: "#050907",
        panel: "#0c1512",
        mint: {
          DEFAULT: "#286848",
          bright: "#3ddc97",
          light: "#d1f7e9",
        },
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(4%,-6%,0) scale(1.12)" },
        },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        drift: "drift 16s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
