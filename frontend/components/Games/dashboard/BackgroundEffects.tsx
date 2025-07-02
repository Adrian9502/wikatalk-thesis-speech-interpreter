import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";

const { height } = Dimensions.get("window");

const BackgroundEffects = React.memo(() => {
  return (
    <>
      {/* Background Layers */}
      <View style={styles.backgroundLayer1} />
      <View style={styles.backgroundLayer2} />
      <View style={styles.backgroundLayer3} />
      <View style={styles.backgroundLayer4} />

      {/* Floating Particles */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={4000}
        style={styles.floatingParticle1}
        useNativeDriver
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={3000}
        style={styles.floatingParticle2}
        useNativeDriver
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={5000}
        style={styles.floatingParticle3}
        useNativeDriver
      />
    </>
  );
});

const styles = StyleSheet.create({
  backgroundLayer1: {
    position: "absolute",
    top: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${BASE_COLORS.blue}15`,
  },
  backgroundLayer2: {
    position: "absolute",
    top: height * 0.2,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${BASE_COLORS.success}10`,
  },
  backgroundLayer3: {
    position: "absolute",
    bottom: -100,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: `${BASE_COLORS.orange}12`,
  },
  backgroundLayer4: {
    position: "absolute",
    top: height * 0.6,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${BASE_COLORS.blue}08`,
  },
  floatingParticle1: {
    position: "absolute",
    top: height * 0.15,
    right: 50,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
  },
  floatingParticle2: {
    position: "absolute",
    top: height * 0.4,
    left: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
  floatingParticle3: {
    position: "absolute",
    bottom: height * 0.3,
    right: 80,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
  },
});

BackgroundEffects.displayName = 'BackgroundEffects';
export default BackgroundEffects;