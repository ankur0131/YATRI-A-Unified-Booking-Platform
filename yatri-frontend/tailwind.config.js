/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080d16",
        ember: "#f97316",
        gold: "#fdba74",
        sand: "#ffedd5",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Manrope"', "sans-serif"],
      },
      boxShadow: {
        glow: "0 24px 70px rgba(249, 115, 22, 0.18)",
        glass: "0 24px 60px rgba(8, 13, 22, 0.42)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -12px, 0)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(18px, -14px, 0) scale(1.06)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.8" },
        },
        shine: {
          "0%": { transform: "translateX(-120%) skewX(-18deg)" },
          "100%": { transform: "translateX(220%) skewX(-18deg)" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 11s ease-in-out infinite",
        drift: "drift 14s ease-in-out infinite",
        "pulse-soft": "pulseSoft 6s ease-in-out infinite",
        shine: "shine 5.5s linear infinite",
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(135deg, rgba(8,13,22,0.92) 0%, rgba(8,13,22,0.76) 42%, rgba(249,115,22,0.18) 100%)",
      },
    },
  },
  plugins: [],
};
