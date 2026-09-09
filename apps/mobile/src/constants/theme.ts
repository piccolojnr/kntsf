export const colors = {
  background: "#f7f6f2",
  surface: "#ffffff",
  surfaceMuted: "#eff2f6",
  primary: "#173b6d",
  primarySoft: "#e3eaf4",
  navy: "#102a4c",
  navySoft: "#e8edf4",
  gold: "#c8922f",
  goldSoft: "#fbf1dc",
  onNavy: "#f8fafc",
  success: "#2d8a4e",
  successSoft: "#dff4e5",
  warning: "#a06a08",
  warningSoft: "#fdf0d1",
  danger: "#b13a4d",
  dangerSoft: "#fde2e7",
  text: "#162238",
  textMuted: "#627087",
  border: "#d9dee7",
  shadow: "#0f172a",
  transparent: "transparent",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  xxxxl: 56,
  xxxxxl: 64,
  pageHeader: 56,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const fontSizes = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const theme = {
  colors,
  spacing,
  radius,
  fontSizes,
};

export const Colors = {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    icon: colors.textMuted,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: "#f5f7fb",
    background: "#101522",
    tint: "#8db2ff",
    icon: "#a8b3ca",
    tabIconDefault: "#a8b3ca",
    tabIconSelected: "#8db2ff",
  },
};
