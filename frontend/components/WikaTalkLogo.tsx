import React, { useRef, useCallback } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { TITLE_COLORS } from "@/theme/colors";
import { useFonts } from "expo-font";
import { useFocusEffect } from "@react-navigation/native";

type WikaTalkLogoProps = {
  title: string;
};

const WikaTalkLogo = ({ title }: WikaTalkLogoProps) => {
  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0); // Reset opacity
      Animated.timing(fadeAnim, {
        toValue: 1, // Fully visible
        duration: 1000, // 1 second fade-in
        useNativeDriver: true,
      }).start();
    }, [])
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.brandContainer}>
        <View style={styles.wikaContainer}>
          <Text style={[styles.letter, { color: TITLE_COLORS.customYellow }]}>
            W
          </Text>
          <Text
            style={[styles.letter, { color: TITLE_COLORS.customBlueLight }]}
          >
            i
          </Text>
          <Text style={[styles.letter, { color: TITLE_COLORS.customRed }]}>
            k
          </Text>
          <Text style={[styles.letter, { color: TITLE_COLORS.customYellow }]}>
            a
          </Text>
        </View>

        {/* Title text */}
        <View style={styles.titleWrapper}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 16,
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
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  titleWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  titleText: {
    letterSpacing: 0.5,
    fontSize: 28,
    fontFamily: "Poppins-SemiBold",
    color: TITLE_COLORS.customWhite,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default WikaTalkLogo;
