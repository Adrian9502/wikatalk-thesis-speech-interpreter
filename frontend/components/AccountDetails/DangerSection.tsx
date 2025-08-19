import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import useThemeStore from "@/store/useThemeStore";
import DeleteAccount from "./DeleteAccount";
import { BASE_COLORS } from "@/constant/colors";

export const DangerSection = () => {
  const { activeTheme } = useThemeStore();

  return (
    <>
      <View
        style={[
          styles.warningContainer,
          { borderLeftColor: activeTheme.secondaryColor },
        ]}
      >
        <AlertTriangle
          size={18}
          color={BASE_COLORS.danger}
          style={styles.icon}
        />
        <Text style={[styles.warningText, { color: BASE_COLORS.darkText }]}>
          The actions below are irreversible. Please proceed with caution.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <DeleteAccount />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  warningContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f0f0",
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
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default DangerSection;
