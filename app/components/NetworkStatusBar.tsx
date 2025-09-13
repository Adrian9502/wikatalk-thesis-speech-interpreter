import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import * as Network from "expo-network";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BASE_COLORS,
  NETWORK_STATUS_BACKGROUND_COLORS,
} from "@/constant/colors";
import { WifiOff, AlertTriangle } from "react-native-feather";
import { useNetworkStore } from "@/store/useNetworkStore";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface NetworkStatusBarProps {
  onHeightChange?: (height: number) => void;
}

const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({
  onHeightChange,
}) => {
  const { status, checkNetworkStatus } = useNetworkStore();
  const [slideAnim] = useState(new Animated.Value(-100));
  const insets = useSafeAreaInsets();

  // Calculate the total height when visible
  const notificationHeight = 23; // Base notification height
  const totalHeight = notificationHeight + insets.top;

  useEffect(() => {
    // Initial check
    checkNetworkStatus();

    // Set up interval for periodic checks
    const interval = setInterval(checkNetworkStatus, 5000);

    // Set up network state listener
    const subscription = Network.addNetworkStateListener((state) => {
      if (!state.isConnected) {
        useNetworkStore.getState().setStatus("offline");
        useNetworkStore.getState().setConnected(false);
      } else {
        useNetworkStore.getState().setConnected(true);
        checkNetworkStatus();
      }
    });

    return () => {
      clearInterval(interval);
      subscription?.remove();
    };
  }, [checkNetworkStatus]);

  // ENHANCED: Better animation timing with immediate parent notification
  useEffect(() => {
    if (status === "online") {
      // Immediately notify parent to start padding animation
      onHeightChange?.(0);

      // Then animate the notification out
      Animated.timing(slideAnim, {
        toValue: -totalHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Immediately notify parent to start padding animation
      onHeightChange?.(totalHeight);

      // Then animate the notification in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [status, slideAnim, totalHeight, onHeightChange]);

  const getStatusConfig = () => {
    switch (status) {
      case "offline":
        return {
          backgroundColor: NETWORK_STATUS_BACKGROUND_COLORS.offline,
          icon: <WifiOff width={12} height={12} color={BASE_COLORS.white} />,
          text: "No internet connection",
          textColor: BASE_COLORS.white,
        };
      case "slow":
        return {
          backgroundColor: NETWORK_STATUS_BACKGROUND_COLORS.slow,
          icon: (
            <AlertTriangle width={12} height={12} color={BASE_COLORS.white} />
          ),
          text: "Slow internet connection",
          textColor: BASE_COLORS.white,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  // Always render the container but make it invisible when online
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config?.backgroundColor || "transparent",
          paddingTop: insets.top,
          transform: [{ translateY: slideAnim }],
          height: totalHeight,
        },
      ]}
      pointerEvents={status === "online" ? "none" : "auto"}
    >
      {config && (
        <View style={styles.content}>
          {config.icon}
          <Text style={[styles.text, { color: config.textColor }]}>
            {config.text}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    flex: 1,
  },
  text: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    textAlign: "center",
  },
});

export default NetworkStatusBar;
