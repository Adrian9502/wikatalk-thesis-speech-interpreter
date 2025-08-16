import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Search, RefreshCw } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";

interface EmptyStateProps {
  onRefresh?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh }) => {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.iconWrapper}>
        <Search width={40} height={40} color="#fff" />
      </View>
      <Text style={styles.emptyStateTitle}>No results found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your search or selecting a different language.
      </Text>

      {/*  refresh button */}
      {onRefresh && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          activeOpacity={0.8}
        >
          <RefreshCw width={18} height={18} color={BASE_COLORS.white} />
          <Text style={styles.refreshButtonText}>Refresh Data</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 20,
  },
  // NEW: Refresh button styles
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    marginTop: 10,
  },
  refreshButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
});

export default EmptyState;
