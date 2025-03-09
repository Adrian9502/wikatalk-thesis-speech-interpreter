import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import React from "react";

const LoadingTranslate = () => {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.loadingText}>Translating...</Text>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    </View>
  );
};

export default LoadingTranslate;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    backgroundColor: "#111827", // bg-gray-900
    width: "50%", // w-1/2
    alignItems: "center",
    justifyContent: "center",
    padding: 20, // p-5
    borderRadius: 12, // rounded-xl
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // shadow-lg
  },
  loadingText: {
    color: "#FACC15", // text-yellow-400
    textAlign: "center",
    fontSize: 18, // text-lg
    marginBottom: 12, // mb-3
  },
});
