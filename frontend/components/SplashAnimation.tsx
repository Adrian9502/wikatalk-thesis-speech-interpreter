import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";
import * as SplashScreen from "expo-splash-screen";
import AppLoading from "./AppLoading";

interface SplashAnimationProps {
  onAnimationFinish?: () => void; // Make optional with ?
}

const SplashAnimation: React.FC<SplashAnimationProps> = ({
  onAnimationFinish,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<LottieView>(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  // Flag to ensure animation is complete before unmounting
  const animationFinishedRef = useRef(false);

  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync().catch(console.error);

    // Play the animation automatically when component mounts
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  const handleAnimationFinish = () => {
    // Mark animation as finished
    animationFinishedRef.current = true;

    // Show the AppLoading component
    setAnimationCompleted(true);

    // If onAnimationFinish is provided, call it
    // We'll delay it slightly to ensure AppLoading is visible
    if (onAnimationFinish) {
      // Only notify parent after a short delay to ensure
      // AppLoading is visible if needed
      setTimeout(() => {
        onAnimationFinish();
      }, 100);
    }
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
        {/* Show AppLoading only after animation completes */}
        {animationCompleted && <AppLoading />}
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
