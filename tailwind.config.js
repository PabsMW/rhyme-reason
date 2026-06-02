/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Ensure all game color utilities exist in CSS for Cursor's design token picker.
    "bg-game-surface-base-level0",
    "bg-game-surface-base-level1",
    "bg-game-surface-base-level2",
    "bg-game-surface-action-primary-default",
    "bg-game-surface-action-primary-hover",
    "bg-game-surface-action-primary-press",
    "bg-game-surface-action-secondary-hover",
    "text-game-text-base-primary",
    "text-game-text-base-secondary",
    "text-game-text-base-tertiary",
    "text-game-text-inverse",
    "border-game-border-surface-level1",
    "border-game-border-surface-level2",
    "border-game-border-action-primary-default",
    "border-game-border-action-primary-hover",
    "bg-game-levels-1",
    "bg-game-levels-2",
    "bg-game-levels-3",
    "bg-game-feedback-error",
    "bg-game-feedback-success",
    "bg-game-surface-component-wordcloudtile-default",
    "hover:bg-game-surface-component-wordcloudtile-hover",
    "bg-game-surface-component-wordcloudtile-placed",
    "bg-game-surface-component-wordcloudtileboard-default",
    "bg-game-surface-component-wordinput-default",
    "bg-game-surface-component-wordinput-disable",
    "border-game-border-component-wordcloudtile",
    "border-game-border-component-wordinput-default",
    "border-game-border-component-wordinput-disable",
    "text-game-text-component-wordcloudtile",
    "text-game-text-component-wordinput-default",
    "text-game-text-component-wordinput-disable",
    "text-game-text-component-question-solved",
    "shadow-question-active",
    "shadow-question-default",
    "shadow-flow-focus",
    "shadow-flow-default",
    "word-drop-zone-board",
    "border-6",
    "border-solid",
    "border-white",
  ],
  theme: {
    extend: {
      borderWidth: {
        6: "6px",
      },
      fontFamily: {
        archivo: ["Archivo", "sans-serif"],
        georgia: ["Georgia", "serif"],
        inter: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "sf-pro": ['"SF Pro Display"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "sf-compact-text": ['"SF Compact Text"', "sans-serif"],
        "sf-compact-display": ['"SF Compact Display"', "sans-serif"],
        "sf-compact-rounded": [
          '"SF Compact Rounded"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        "sf-pro-rounded": [
          '"SF Pro Rounded"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      colors: {
        game: {
          surface: {
            base: {
              level0: "var(--game-surface-base-level0)",
              level1: "var(--game-surface-base-level1)",
              level2: "var(--game-surface-base-level2)",
            },
            action: {
              primary: {
                default: "var(--game-surface-action-primary-default)",
                hover: "var(--game-surface-action-primary-hover)",
                press: "var(--game-surface-action-primary-press)",
              },
              secondary: {
                hover: "var(--game-surface-action-secondary-hover)",
              },
            },
            component: {
              wordcloudtile: {
                default: "var(--game-surface-component-wordcloudtile-default)",
                hover: "var(--game-surface-component-wordcloudtile-hover)",
                placed: "var(--game-surface-component-wordcloudtile-placed)",
              },
              wordcloudtileboard: {
                default: "var(--game-surface-component-wordcloudtileboard-default)",
              },
              wordinput: {
                default: "var(--game-surface-component-wordinput-default)",
                disable: "var(--game-surface-component-wordinput-disable)",
              },
            },
          },
          text: {
            base: {
              primary: "var(--game-text-base-primary)",
              secondary: "var(--game-text-base-secondary)",
              tertiary: "var(--game-text-base-tertiary)",
            },
            inverse: "var(--game-text-inverse)",
            component: {
              wordcloudtile: "var(--game-text-component-wordcloudtile)",
              wordinput: {
                default: "var(--game-text-component-wordinput-default)",
                disable: "var(--game-text-component-wordinput-disable)",
              },
              question: {
                solved: "var(--game-text-component-question-solved)",
              },
            },
          },
          border: {
            surface: {
              level1: "var(--game-border-surface-level1)",
              level2: "var(--game-border-surface-level2)",
            },
            action: {
              primary: {
                default: "var(--game-border-action-primary-default)",
                hover: "var(--game-border-action-primary-hover)",
              },
            },
            component: {
              wordcloudtile: "var(--game-border-component-wordcloudtile)",
              wordinput: {
                default: "var(--game-border-component-wordinput-default)",
                disable: "var(--game-border-component-wordinput-disable)",
              },
            },
          },
          levels: {
            1: "var(--game-levels-1)",
            2: "var(--game-levels-2)",
            3: "var(--game-levels-3)",
          },
          feedback: {
            error: "var(--game-feedback-error)",
            success: "var(--game-feedback-success)",
          },
        },
      },
      boxShadow: {
        "btn-primary": "0 4px 0 0 var(--game-shadow-action-primary-depth)",
        chip: "0px 4px 7px 0px rgba(0, 0, 0, 0.03)",
        "question-active": "0px 4px 0px var(--game-shadow-component-question-active)",
        "question-default": "0px 2px 0px var(--game-shadow-component-question-default)",
        "flow-focus": "var(--game-shadow-component-flow-focus)",
        "flow-default": "var(--game-shadow-component-flow-default)",
      },
      keyframes: {
        "slide-up-footer": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "zone-reject": {
          "0%, 100%": {
            transform: "translateX(0)",
            borderColor: "var(--game-border-surface-level2)",
          },
          "15%, 45%, 75%": { transform: "translateX(-8px)" },
          "30%, 60%, 90%": { transform: "translateX(8px)" },
          "35%, 65%": { borderColor: "var(--game-feedback-error)" },
        },
      },
      animation: {
        "slide-up-footer": "slide-up-footer 0.35s ease-out both",
        "zone-reject": "zone-reject 0.45s ease-in-out both",
      },
    },
  },
  plugins: [],
};
