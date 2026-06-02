export type ColorToken = {
  name: string;
  className: string;
  hex: string;
};

export type FontToken = {
  name: string;
  className: string;
  sample: string;
};

export type ShadowToken = {
  name: string;
  className: string;
};

export const surfaceColors: ColorToken[] = [
  { name: "Base level 0", className: "bg-game-surface-base-level0", hex: "#f8fafc" },
  { name: "Base level 1", className: "bg-game-surface-base-level1", hex: "#e2e8f0" },
  { name: "Base level 2", className: "bg-game-surface-base-level2", hex: "#ffffff" },
  {
    name: "Action primary default",
    className: "bg-game-surface-action-primary-default",
    hex: "#44370a",
  },
  {
    name: "Action primary hover",
    className: "bg-game-surface-action-primary-hover",
    hex: "#3B82F6",
  },
  {
    name: "Action primary press",
    className: "bg-game-surface-action-primary-press",
    hex: "#a68519",
  },
  {
    name: "Action secondary hover",
    className: "bg-game-surface-action-secondary-hover",
    hex: "#f9f2d9",
  },
];

export const textColors: ColorToken[] = [
  { name: "Base primary", className: "text-game-text-base-primary", hex: "#44370a" },
  { name: "Base secondary", className: "text-game-text-base-secondary", hex: "#94a3b8" },
  { name: "Base tertiary", className: "text-game-text-base-tertiary", hex: "#8f8473" },
  { name: "Inverse", className: "text-game-text-inverse", hex: "#ffffff" },
];

export const borderColors: ColorToken[] = [
  { name: "Surface level 1", className: "border-game-border-surface-level1", hex: "#efebe1" },
  { name: "Surface level 2", className: "border-game-border-surface-level2", hex: "#e1d9c6" },
  {
    name: "Action primary default",
    className: "border-game-border-action-primary-default",
    hex: "#94a3b8",
  },
  {
    name: "Action primary hover",
    className: "border-game-border-action-primary-hover",
    hex: "#44370a",
  },
];

export const levelColors: ColorToken[] = [
  { name: "Level 1", className: "bg-game-levels-1", hex: "#39d9c4" },
  { name: "Level 2", className: "bg-game-levels-2", hex: "#ffd400" },
  { name: "Level 3", className: "bg-game-levels-3", hex: "#fe6023" },
];

export const feedbackColors: ColorToken[] = [
  { name: "Error", className: "bg-game-feedback-error", hex: "#c44b2a" },
  { name: "Success", className: "bg-game-feedback-success", hex: "#2a8f5c" },
];

/** surface/component/wordcloudtile */
/** surface / border / text — component/wordinput (guess section) */
export const wordinputColors: ColorToken[] = [
  {
    name: "Default surface (blue-700)",
    className: "bg-game-surface-component-wordinput-default",
    hex: "#1d4ed8",
  },
  {
    name: "Disabled surface",
    className: "bg-game-surface-component-wordinput-disable",
    hex: "#bcbfd4",
  },
  {
    name: "Default border (blue-700)",
    className: "border-game-border-component-wordinput-default",
    hex: "#1d4ed8",
  },
  {
    name: "Disabled border",
    className: "border-game-border-component-wordinput-disable",
    hex: "#bcbfd4",
  },
  {
    name: "Default text (white)",
    className: "text-game-text-component-wordinput-default",
    hex: "#ffffff",
  },
  {
    name: "Disabled text (white)",
    className: "text-game-text-component-wordinput-disable",
    hex: "#ffffff",
  },
];

export const wordcloudtileColors: ColorToken[] = [
  {
    name: "Default (yellow-100)",
    className: "bg-game-surface-component-wordcloudtile-default",
    hex: "#fef9c3",
  },
  {
    name: "Hover (yellow-50)",
    className: "bg-game-surface-component-wordcloudtile-hover",
    hex: "#fefce8",
  },
  {
    name: "Placed (yellow-300)",
    className: "bg-game-surface-component-wordcloudtile-placed",
    hex: "#fde047",
  },
  {
    name: "Border (yellow-300)",
    className: "border-game-border-component-wordcloudtile",
    hex: "#fde047",
  },
  {
    name: "Text (slate-950)",
    className: "text-game-text-component-wordcloudtile",
    hex: "#020617",
  },
];

export const fontFamilies: FontToken[] = [
  { name: "Archivo", className: "font-archivo", sample: "Rhyme & Reason" },
  { name: "Georgia", className: "font-georgia", sample: "Secondary serif copy" },
  { name: "Inter", className: "font-inter", sample: "Body copy and UI labels" },
  { name: "SF Pro Display", className: "font-sf-pro", sample: "Word cloud tiles" },
];

export const textVariants = [
  { name: "Title", className: "font-archivo text-4xl leading-none text-game-text-base-primary" },
  {
    name: "Subtitle",
    className: "font-archivo text-2xl leading-tight text-game-text-base-secondary",
  },
  { name: "Body", className: "font-inter text-base leading-relaxed text-game-text-base-primary" },
  {
    name: "Label",
    className:
      "font-sf-pro text-sm font-semibold uppercase tracking-wide text-game-text-base-tertiary",
  },
  { name: "Caption", className: "font-inter text-sm text-game-text-base-tertiary" },
] as const;

export const shadows: ShadowToken[] = [
  { name: "Button primary", className: "shadow-btn-primary" },
  { name: "Chip", className: "shadow-chip" },
  { name: "Flow step focus", className: "shadow-flow-focus" },
  { name: "Flow step default", className: "shadow-flow-default" },
];
