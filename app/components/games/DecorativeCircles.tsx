import React from "react";
import { View, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constants/colors";

interface DecorativeCirclesProps {
  variant?: "double" | "triple"; // Control number of circles
  colors?: {
    circle1?: string;
    circle2?: string;
    circle3?: string;
  };
}

const DecorativeCircles: React.FC<DecorativeCirclesProps> = ({
  variant = "triple",
  colors = {},
}) => {
  return (
    <>
      {/* Circle 1 - Top Right */}
      <View
        style={[
          styles.decorativeCircle1,
          { backgroundColor: colors.circle1 || `${BASE_COLORS.blue}20` },
        ]}
      />

      {/* Circle 2 - Bottom Left */}
      <View
        style={[
          styles.decorativeCircle2,
          { backgroundColor: colors.circle2 || `${BASE_COLORS.blue}15` },
        ]}
      />

      {/* Circle 3 - Bottom Right (only shown in triple variant) */}
      {variant === "triple" && (
        <View
          style={[
            styles.decorativeCircle3,
            { backgroundColor: colors.circle3 || `${BASE_COLORS.success}15` },
          ]}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  decorativeCircle1: {
    position: "absolute",
    top: 10,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: -80,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
});

export default DecorativeCircles;
