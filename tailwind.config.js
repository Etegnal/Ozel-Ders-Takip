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
        background: "#031427",
        surface: {
          DEFAULT: "#061a33",
          card: "#092446",
          hover: "#0e315b",
        },
        border: "#0f3769",
        primary: {
          DEFAULT: "#FF8830",
          hover: "#e36e19",
          light: "#A6DFFF",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A6DFFF",
          muted: "#668bb5",
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
