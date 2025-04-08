import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import * as SplashScreen from "expo-splash-screen";
import AppLoading from "@/components/AppLoading";

const SplashAnimation: React.FC = () => {
  const animationRef = useRef<LottieView>(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync().catch(console.error);

    // Play the animation automatically when component mounts
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  const handleAnimationFinish = () => {
    // Just mark animation as completed to show the loading indicator
    setAnimationCompleted(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          ref={animationRef}
          source={require("../assets/animations/splash-animation.json")}
          autoPlay={false}
          loop={false}
          onAnimationFinish={handleAnimationFinish}
          style={styles.animation}
        />
      </View>
      <View style={styles.loadingContainer}>
        {/* Show loading indicator after animation completes */}
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
