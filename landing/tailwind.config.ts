import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: { DEFAULT: "#0a0a0a", light: "#fafafa" },
        surface: { DEFAULT: "#111111", light: "#f5f5f5" },
        raised: { DEFAULT: "#1a1a1a", light: "#eaeaea" },
        overlay: { DEFAULT: "#222222", light: "#e0e0e0" },
        border: { DEFAULT: "#2a2a2a", light: "#e0e0e0" },
        borderStrong: { DEFAULT: "#404040", light: "#bdbdbd" },
        ink: { DEFAULT: "#fafafa", light: "#0a0a0a" },
        inkMuted: { DEFAULT: "#a3a3a3", light: "#666666" },
        inkSubtle: { DEFAULT: "#525252", light: "#999999" },
        accent: {
          DEFAULT: "#10b981",
          dark: "#059669",
          light: "#34d399",
          glow: "rgba(16,185,129,0.15)",
        },
        success: "#22c55e",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "cursor-blink": "cursorBlink 1s step-end infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        cursorBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(127,127,127,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(127,127,127,0.04) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
