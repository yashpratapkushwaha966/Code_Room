/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark teal theme. `ink` = main text (light), `paper` = page background (dark).
        ink: { DEFAULT: "#E6F7F5", light: "#A9C7C4" },
        aqua: { DEFAULT: "#22E3D0", light: "#7CF2E6", deep: "#0E7C7B" },
        sage: { DEFAULT: "#6EE7B7" },
        paper: "#040A0C",
        surface: "#0A1619",
      },
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: { xl2: "1.1rem" },
      boxShadow: { glow: "0 0 40px -8px rgba(34,227,208,.55)" },
      keyframes: {
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(4%,-3%,0) scale(1.15)" },
        },
      },
      animation: { drift: "drift 14s ease-in-out infinite" },
    },
  },
  plugins: [],
};
