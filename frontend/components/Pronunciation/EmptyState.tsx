import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Search } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";

const EmptyState = () => {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.iconWrapper}>
        <Search width={40} height={40} color="#fff" />
      </View>
      <Text style={styles.emptyStateTitle}>No results found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your search or selecting a different language.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  iconWrapper: {
    backgroundColor: BASE_COLORS.orange,
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 17,
    color: BASE_COLORS.white,
    marginBottom: 10,
  },
  emptyStateText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.borderColor,
    textAlign: "center",
    maxWidth: 280,
  },
});

export default EmptyState;
