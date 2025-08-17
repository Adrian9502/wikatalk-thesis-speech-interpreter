import React, { useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

interface DotsLoaderProps {
  colors?: string[];
}

const DotsLoader: React.FC<DotsLoaderProps> = ({
  colors = ["#FCD116", "#0038a8", "#ce1126", "#FCD116"],
}) => {
  const dotScale = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      dotScale.stopAnimation();
    };
  }, []);

  const getScaleForDot = (index: number) => {
    return dotScale.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
      extrapolate: "clamp",
    });
  };

  return (
    <View style={styles.dotsContainer}>
      {colors.map((color, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              transform: [{ scale: getScaleForDot(index) }],
              opacity: getScaleForDot(index),
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    marginHorizontal: 3,
  },
});

export default DotsLoader;
