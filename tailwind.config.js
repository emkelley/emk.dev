/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        void: "#0c0020",
        deep: "#040015",
        ink: "#dbd4fa",
        muted: "#8e85b0",
        cyan: "#24cdc5",
        magenta: "#ff7edb",
        coral: "#f97e72",
        violet: "#c89cff",
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
