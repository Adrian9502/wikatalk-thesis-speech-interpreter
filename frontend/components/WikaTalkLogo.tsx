import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { TITLE_COLORS } from "@/constant/colors";
import { useFonts } from "expo-font";

type WikaTalkLogoProps = {
  title: string;
  fontSize?: number;
};

const WikaTalkLogo = ({ title, fontSize = 24 }: WikaTalkLogoProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Start opacity at 0

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Fully visible
      duration: 1000, // 1 second fade in
      useNativeDriver: true,
    }).start();
  }, []); // Run when component mounts

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.brandContainer}>
        <View style={styles.wikaContainer}>
          <Text
            style={[
              styles.letter,
              { fontSize, color: TITLE_COLORS.customYellow },
            ]}
          >
            W
          </Text>
          <Text
            style={[
              styles.letter,
              { fontSize, color: TITLE_COLORS.customBlueLight },
            ]}
          >
            i
          </Text>
          <Text
            style={[styles.letter, { fontSize, color: TITLE_COLORS.customRed }]}
          >
            k
          </Text>
          <Text
            style={[
              styles.letter,
              { fontSize, color: TITLE_COLORS.customYellow },
            ]}
          >
            a
          </Text>
        </View>

        {/* Title text */}
        <View style={styles.titleWrapper}>
          <Text style={[styles.titleText, { fontSize }]}>{title}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  wikaContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  letter: {
    letterSpacing: 0.5,
    fontFamily: "Poppins-Bold",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  titleWrapper: {
    overflow: "hidden",
  },
  titleText: {
    letterSpacing: 0.5,
    fontFamily: "Poppins-Bold",
    color: TITLE_COLORS.customWhite,
  },
});

export default WikaTalkLogo;
