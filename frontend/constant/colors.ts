export const TITLE_COLORS: Record<string, string> = {
  customNavyBlue: "#0a0f28",
  customYellow: "#FCD116",
  customBlue: "#0038a8",
  customBlueLight: "#4785ff",
  customRed: "#ce1126",
  customWhite: "#F5F5F5",
};

export const BASE_COLORS: Record<string, string> = {
  blue: "#4A6FFF",
  orange: "#FF6F4A",
  lightBlue: "#E2EAFF",
  lightPink: "#F3E2FF",
  white: "#FFFFFF",
  darkText: "#212132",
  placeholderText: "#9E9EA7",
  borderColor: "#E8E8ED",
  success: "#10B981",
};

export const getPositionalColors = (
  position: "top" | "bottom"
): Record<string, string> => {
  return {
    primary: position === "top" ? BASE_COLORS.blue : BASE_COLORS.orange,
    secondary:
      position === "top" ? BASE_COLORS.lightBlue : BASE_COLORS.lightPink,
    background: BASE_COLORS.white,
    text: BASE_COLORS.darkText,
    placeholder: BASE_COLORS.placeholderText,
    border: BASE_COLORS.borderColor,
    success: BASE_COLORS.success,
  };
};
