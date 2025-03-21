import { StyleSheet } from "react-native";
import { TITLE_COLORS } from "@/constant/colors";

export const getGlobalStyles = (backgroundColor: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
      paddingHorizontal: 20,
    },
  });

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TITLE_COLORS.customNavyBlue,
    paddingHorizontal: 20,
  },
});
