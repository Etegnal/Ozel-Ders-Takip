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
        background: "#121212",
        surface: {
          DEFAULT: "#18181b",
          card: "#1e1e24",
          hover: "#27272a",
        },
        border: "#27272a",
        primary: {
          DEFAULT: "#f97316", // Amber / orange-500
          hover: "#ea580c", // orange-600
          light: "#ffedd5", // orange-100
        },
        text: {
          primary: "#f4f4f5",
          secondary: "#a1a1aa",
          muted: "#71717a",
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
