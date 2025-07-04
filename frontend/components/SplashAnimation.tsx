import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";
import * as SplashScreen from "expo-splash-screen";
import AppLoading from "@/components/AppLoading";
import { useSplashStore } from "@/store/useSplashStore";

const SplashAnimation: React.FC = () => {
  const animationRef = useRef<LottieView>(null);
  const gameDataPreloaded = useSplashStore((state) => state.gameDataPreloaded);

  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync().catch(console.error);

    // Play the animation automatically when component mounts
    if (animationRef.current) {
      setTimeout(() => {
        animationRef.current?.play();
      }, 100);
    }

    // Show loading progress messages
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
    }, 1500);

    return () => {
      console.log("Splash animation unmounted");
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          ref={animationRef}
          source={require("../assets/animations/splash-animation.json")}
          autoPlay={false} // Set to true to ensure animation starts
          loop={false}
          style={styles.animation}
        />
      </View>
      <View style={styles.loadingContainer}>
        <AppLoading />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0a0f28",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 40,
    zIndex: 999,
  },
  animationContainer: {
    paddingTop: 20,
    width: "100%",
    alignItems: "center",
  },
  animation: {
    width: 200,
    height: 200,
  },
  loadingContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
});

export default SplashAnimation;
