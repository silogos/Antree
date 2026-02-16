/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        "primary-dark": "#4f46e5",
        secondary: "#8b5cf6",
        accent: "#ec4899",
        dark: "#111827",
        darker: "#0f172a",
        glass: "rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backdropBlur: {
        sm: "blur(4px)",
        md: "blur(8px)",
        lg: "blur(12px)",
      },
    },
  },
  plugins: [],
};
