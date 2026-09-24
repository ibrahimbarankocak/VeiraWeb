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
        // Theme-aware tokens (values live in app/globals.css). Use text-fg / bg-fg/10 instead of white.
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
        onbright: "rgb(var(--c-onbright) / <alpha-value>)", // text on a bg-mint-bright fill
        onmint: "#04150d", // always-dark text for the bright mint/lime gradient buttons
        mint: {
          DEFAULT: "#286848",
          bright: "rgb(var(--c-mint-bright) / <alpha-value>)",
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
