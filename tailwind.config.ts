import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#FBF3E4",
        cocoa: "#3D2418",
        butterscotch: "#C87F3D",
        cherry: "#C4485C",
        buttercream: "#F6E4B8",
        sprig: "#7A9E7E",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        ticket: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        cookie: "50% 50% 48% 52% / 52% 48% 52% 48%",
      },
    },
  },
  plugins: [],
};
export default config;
