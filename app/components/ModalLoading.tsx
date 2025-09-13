import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { ActivityIndicator } from "react-native-paper";
import { BASE_COLORS } from "@/constant/colors";
import { FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

const ModalLoading = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={BASE_COLORS.white} size="small" />
      <Text style={styles.loadingText}>Loading data...</Text>
    </View>
  );
};

export default ModalLoading;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 16,
  },
});
