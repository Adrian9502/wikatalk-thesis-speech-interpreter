import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = React.memo(({ message = "Loading..." }: LoadingIndicatorProps) => {
  return (
    <Animatable.View 
      animation="fadeIn" 
      style={styles.container}
      useNativeDriver
    >
      <ActivityIndicator size="large" color={BASE_COLORS.blue} />
      <Text style={styles.text}>{message}</Text>
    </Animatable.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
  }
});

LoadingIndicator.displayName = 'LoadingIndicator';
export default LoadingIndicator;