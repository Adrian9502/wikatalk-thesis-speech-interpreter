import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Image } from "react-native";
import { Star } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS } from "@/constant/colors";
import { getDifficultyColors } from "@/utils/gameUtils";

interface RewardInfo {
  coins: number;
  label: string;
  difficulty: string;
  timeSpent: number;
  tier?: any;
}

interface RewardNotificationProps {
  visible: boolean;
  rewardInfo: RewardInfo | null;
  onComplete?: () => void;
}

const RewardNotification: React.FC<RewardNotificationProps> = ({
  visible,
  rewardInfo,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible && rewardInfo && rewardInfo.coins > 0) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(-100);
      scaleAnim.setValue(0.8);

      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after delay
      const hideTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onComplete) {
            onComplete();
          }
        });
      }, 3000);

      return () => clearTimeout(hideTimer);
    }
  }, [visible, rewardInfo]);

  if (!visible || !rewardInfo || rewardInfo.coins <= 0) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else {
      return `${(seconds / 60).toFixed(1)}m`;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={getDifficultyColors(rewardInfo.difficulty)}
        style={styles.notification}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          {/* FIXED: Use Star icon from react-native-feather */}
          <Star width={24} height={24} color={BASE_COLORS.white} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Reward Earned!</Text>
          <View style={styles.coinsContainer}>
            <Image
              source={require("@/assets/images/coin.png")}
              style={{ width: 16, height: 16 }}
            />
            <Text style={styles.coinsText}>+{rewardInfo.coins} coins</Text>
          </View>
          <Text style={styles.subtitle}>
            {rewardInfo.label} • {formatTime(rewardInfo.timeSpent)}
          </Text>
          <Text style={styles.difficulty}>
            {rewardInfo.difficulty.charAt(0).toUpperCase() +
              rewardInfo.difficulty.slice(1)}{" "}
            Mode
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 10,
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  coinsText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFD700",
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 2,
  },
  difficulty: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
  },
});

export default RewardNotification;
