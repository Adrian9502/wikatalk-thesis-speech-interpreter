import React, { useState, useEffect, useRef } from "react";
import { BackHandler, ToastAndroid, Platform } from "react-native";

interface NavigationWarningProps {
  gameStatus: "idle" | "playing" | "completed";
  timerRunning: boolean;
  onUserExit?: () => void;
}

const NavigationWarning: React.FC<NavigationWarningProps> = ({
  gameStatus,
  timerRunning,
  onUserExit,
}) => {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const backPressCountRef = useRef(0);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only show warning during active gameplay
    if (gameStatus !== "playing" || !timerRunning) {
      return;
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        console.log(
          `[NavigationWarning] Back press detected, count: ${
            backPressCountRef.current + 1
          }`
        );

        backPressCountRef.current += 1;

        if (backPressCountRef.current === 1) {
          // First back press - show toast warning
          console.log("[NavigationWarning] First back press - showing toast");

          if (Platform.OS === "android") {
            ToastAndroid.show(
              "Press again to exit the game.",
              ToastAndroid.SHORT
            );
          }

          setIsToastVisible(true);

          // Auto-hide toast after 3 seconds
          toastTimeoutRef.current = setTimeout(() => {
            setIsToastVisible(false);
            console.log("[NavigationWarning] Toast auto-hidden");
          }, 3000);

          // Reset counter after 3 seconds if no second press
          resetTimeoutRef.current = setTimeout(() => {
            backPressCountRef.current = 0;
            setIsToastVisible(false);
            console.log("[NavigationWarning] Back press counter reset");
          }, 3000);

          return true; // Prevent navigation
        } else if (backPressCountRef.current >= 2 && isToastVisible) {
          // Second back press while toast is visible - trigger user exit
          console.log(
            "[NavigationWarning] Second back press - triggering user exit"
          );

          // Clear timeouts
          if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = null;
          }
          if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
            resetTimeoutRef.current = null;
          }

          // Reset state
          setIsToastVisible(false);
          backPressCountRef.current = 0;

          // Trigger user exit callback
          if (onUserExit) {
            onUserExit();
          }

          return true; // Prevent default navigation
        }

        return true; // Prevent navigation by default
      }
    );

    return () => {
      backHandler.remove();
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [gameStatus, timerRunning, isToastVisible, onUserExit]);

  // Reset state when game status changes
  useEffect(() => {
    if (gameStatus !== "playing" || !timerRunning) {
      setIsToastVisible(false);
      backPressCountRef.current = 0;

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    }
  }, [gameStatus, timerRunning]);

  // This component doesn't render anything visible
  return null;
};

export default NavigationWarning;
