/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#060913",
        surface: {
          DEFAULT: "#0b101d",
          card: "#101728",
          hover: "#172138",
        },
        border: "#19253d",
        primary: {
          DEFAULT: "#FF8830",
          hover: "#E0721D",
          light: "#A6DFFF",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2s infinite ease-in-out",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.85, transform: "scale(1.02)" },
        }
      }
    },
  },
  plugins: [],
}
