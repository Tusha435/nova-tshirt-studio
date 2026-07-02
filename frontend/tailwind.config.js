/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        hero: ["Unbounded", "Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#191536",
        paper: "#f6f5fe",
        neon: "#6d4aff",
        cyber: "#0093b8",
        magenta: "#e02ec4",
        lime: "#71b40a",
        hot: "#ff4d8d",
      },
      boxShadow: {
        glow: "0 24px 70px rgba(109, 74, 255, 0.24)",
        deep: "0 30px 90px rgba(90, 70, 190, 0.14)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(109,74,255,0.16), transparent 28%), radial-gradient(circle at 85% 15%, rgba(0,190,235,0.14), transparent 24%)",
        "glass-panel":
          "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
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