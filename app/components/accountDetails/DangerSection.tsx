import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import useThemeStore from "@/store/useThemeStore";
import DeleteAccount from "./DeleteAccount";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

// Memoize the warning icon
const WarningIcon = React.memo(() => (
  <AlertTriangle size={16} color={BASE_COLORS.danger} style={styles.icon} />
));

// Memoize the warning text component
const WarningText = React.memo(({ textColor }: { textColor: string }) => (
  <Text style={[styles.warningText, { color: textColor }]}>
    The actions below are irreversible. Please proceed with caution.
  </Text>
));

export const DangerSection = React.memo(() => {
  const { activeTheme } = useThemeStore();

  // Memoize style objects
  const warningContainerStyle = React.useMemo(
    () => [
      styles.warningContainer,
      { borderLeftColor: activeTheme.secondaryColor },
    ],
    [activeTheme.secondaryColor]
  );

  return (
    <>
      <View style={warningContainerStyle}>
        <WarningIcon />
        <WarningText textColor={BASE_COLORS.darkText} />
      </View>

      <View style={styles.buttonContainer}>
        <DeleteAccount />
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  warningContainer: {
    flexDirection: "row",
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    padding: 12,
    alignItems: "flex-start",
    borderLeftWidth: 6,
  },
  icon: {
    margin: 8,
  },
  warningText: {
    marginLeft: 10,
    flex: 1,
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

DangerSection.displayName = "DangerSection";
export default DangerSection;
