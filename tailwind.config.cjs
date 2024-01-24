module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      green: "#61783E",
      red: "#f55877",
      "gray-dark": "#273444",
      gray: "#5A5252",
      white: "#ffffff",
      "gray-light": "#d3dce6",
      black: "#373e49",
    },
    extend: {
      animation: {
        "spin-slow": "spin 20s linear infinite",
      },
    },
  },
  prefix: "",
  plugins: [],
};
