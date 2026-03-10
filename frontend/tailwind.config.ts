import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        drift: "#6b7280",
        tide: "#0f766e",
        dawn: "#fbf7ef"
      }
    }
  },
  plugins: []
};

export default config;
