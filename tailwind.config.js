/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        gidugu: ["Gidugu", "sans-serif"],
        georgia: ["Georgia", "serif"],
        inter: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        game: {
          surface: {
            base: {
              level0: "#fcf8eb",
              level1: "#f8f6f1",
              level2: "#ffffff",
            },
            action: {
              primary: {
                default: "#44370a",
                hover: "#755e12",
                press: "#a68519",
              },
              secondary: {
                hover: "#f9f2d9",
              },
            },
          },
          text: {
            base: {
              primary: "#44370a",
              secondary: "#755e12",
              tertiary: "#8f8473",
            },
            inverse: "#ffffff",
          },
          border: {
            surface: {
              level1: "#efebe1",
              level2: "#e1d9c6",
            },
            action: {
              primary: {
                default: "#755e12",
                hover: "#44370a",
              },
            },
          },
          levels: {
            1: "#39d9c4",
            2: "#ffd400",
            3: "#fe6023",
          },
          feedback: {
            error: "#c44b2a",
            success: "#2a8f5c",
          },
        },
      },
      boxShadow: {
        "btn-primary": "0px 4px 7px 0px rgba(0, 0, 0, 0.03)",
        chip: "0px 4px 7px 0px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};
