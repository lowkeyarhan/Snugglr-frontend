/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#6c2bee",
        "primary-hover": "#581fd1",
        "primary-light": "#8b5cf6",
        "primary-dark": "#5b21b6",
        secondary: "#f43f5e",
        "background-light": "#f6f6f8",
        "background-dark": "#161022",
        "card-light": "#ffffff",
        "card-dark": "#1F1A2D",
        "bubble-light": "#ffffff",
        "bubble-dark": "#2a2438",
        "text-light": "#1e293b",
        "text-dark": "#e2e8f0",
        "muted-light": "#64748b",
        "muted-dark": "#94a3b8",
        "text-muted-light": "#6E6E73",
        "text-muted-dark": "#8E8E93",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
        pacifico: ["Pacifico", "cursive"],
        serif: ["Cinzel", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        full: "9999px",
        bubble: "2.5rem",
        "bubble-sm": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 50px -5px rgba(108, 43, 238, 0.3)",
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        lifted:
          "0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.07)",
        bubble: "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
      },
      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-delayed": "float 8s ease-in-out 4s infinite",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
