/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        void: "#07111c",
        deep: "#030810",
        ink: "#d5deef",
        muted: "#7d8ba0",
        cyan: "#24cdc5",
        magenta: "#4d9fff",
        coral: "#f97e72",
        violet: "#8eb6e8",
      },
      fontFamily: {
        display: ['"Saira Extra Condensed"', "sans-serif"],
        sans: ['"Source Sans 3"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
};
