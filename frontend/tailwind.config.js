/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#07060e",
        neon: "#7c5cff",
        cyber: "#00f0ff",
        magenta: "#ff3df0",
        lime: "#b6ff3d",
        hot: "#ff4d8d",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(124, 92, 255, 0.28)",
        deep: "0 30px 110px rgba(0, 0, 0, 0.24)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(124,92,255,0.18), transparent 28%), radial-gradient(circle at 85% 15%, rgba(0,240,255,0.16), transparent 24%)",
        "glass-panel":
          "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.8s linear infinite",
      },
    },
  },
  plugins: [],
};