import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "fx-bg": "#0a0a0a",
        "fx-card": "#121212",
        "fx-card-light": "#1a1a1a",
        "fx-orange": "#f97316",
        "fx-orange-dark": "#c2410c",
        "fx-orange-light": "#fdba74",
        "fx-border": "#262626",
        "fx-text": "#e5e5e5",
        "fx-text-muted": "#a3a3a3",
      },
      fontFamily: {
        "fx-mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;