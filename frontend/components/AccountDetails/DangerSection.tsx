import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import useThemeStore from "@/store/useThemeStore";
import DeleteAccount from "./DeleteAccount";
import { BASE_COLORS } from "@/constant/colors";

export const DangerSection = () => {
  const { activeTheme } = useThemeStore();

  return (
    <View style={[styles.container]}>
      <View
        style={[
          styles.warningContainer,
          { borderLeftColor: activeTheme.secondaryColor },
        ]}
      >
        <AlertTriangle size={23} color="#FF9500" style={styles.icon} />
        <Text style={[styles.warningText, { color: BASE_COLORS.darkText }]}>
          The actions below are irreversible. Please proceed with caution.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <DeleteAccount />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 20,
  },
  warningContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f0f0",
    borderRadius: 16,
    padding: 12,
    marginVertical: 16,
    alignItems: "flex-start",
    borderLeftWidth: 4,
  },
  icon: {
    margin: 8,
  },
  warningText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 8,
  },
});

export default DangerSection;
