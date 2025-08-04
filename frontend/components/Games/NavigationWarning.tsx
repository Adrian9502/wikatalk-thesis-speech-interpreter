import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, BackHandler } from "react-native";
import * as Animatable from "react-native-animatable";
import { AlertTriangle } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";

interface NavigationWarningProps {
  gameStatus: "idle" | "playing" | "completed";
  timerRunning: boolean;
}

const NavigationWarning: React.FC<NavigationWarningProps> = ({
  gameStatus,
  timerRunning,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const backPressCountRef = useRef(0);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only show warning during active gameplay
    if (gameStatus !== "playing" || !timerRunning) {
      return;
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        backPressCountRef.current += 1;

        if (backPressCountRef.current === 1) {
          // First back press - show warning
          setShowWarning(true);

          // Auto-hide warning after 3 seconds
          warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(false);
            backPressCountRef.current = 0;
          }, 3000);

          return true; // Prevent navigation
        } else if (backPressCountRef.current >= 2) {
          // Second back press - allow navigation
          setShowWarning(false);
          backPressCountRef.current = 0;

          if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
          }

          return false; // Allow default navigation
        }

        return true; // Prevent navigation by default
      }
    );

    return () => {
      backHandler.remove();
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [gameStatus, timerRunning]);

  // Reset warning when game status changes
  useEffect(() => {
    if (gameStatus !== "playing" || !timerRunning) {
      setShowWarning(false);
      backPressCountRef.current = 0;

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
    }
  }, [gameStatus, timerRunning]);

  if (!showWarning) {
    return null;
  }

  return (
    <Animatable.View
      animation="slideInUp"
      duration={300}
      style={styles.warningContainer}
    >
      <View style={styles.warningContent}>
        <AlertTriangle width={20} height={20} color="#FFA726" />
        <Text style={styles.warningText}>Press back again to exit game</Text>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  warningContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 167, 38, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  warningText: {
    color: BASE_COLORS.white,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
});

export default NavigationWarning;
