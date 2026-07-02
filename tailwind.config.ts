import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171412",
        mist: "#F6F4EF",
        line: "#E7E1D7",
        brand: "#B8462F",
        moss: "#62715E",
        night: "#202733"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(23, 20, 18, 0.10)",
        card: "0 10px 30px rgba(32, 39, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
