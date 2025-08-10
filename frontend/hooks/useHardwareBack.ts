import { useEffect } from "react";
import { BackHandler } from "react-native";
import { router } from "expo-router";

// Define allowed fallback routes for better type safety
type AllowedFallbackRoutes =
  | "/(tabs)/Settings"
  | "/(tabs)/Speech"
  | "/(tabs)/Translate"
  | "/(tabs)/Scan"
  | "/(tabs)/Pronounce"
  | "/(tabs)/Games";

interface UseHardwareBackOptions {
  enabled?: boolean;
  onBackPress?: () => boolean | void;
  fallbackRoute?: AllowedFallbackRoutes;
  useExistingHeaderLogic?: boolean;
}

export const useHardwareBack = ({
  enabled = true,
  onBackPress,
  fallbackRoute = "/(tabs)/Settings",
  useExistingHeaderLogic = false,
}: UseHardwareBackOptions = {}) => {
  useEffect(() => {
    if (!enabled) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        try {
          // If custom handler is provided, use it
          if (onBackPress) {
            const result = onBackPress();
            // If custom handler returns true, prevent default behavior
            if (result === true) return true;
            // If custom handler returns false or undefined, continue with default
          }

          // If using existing header logic, mimic the Header component behavior
          if (useExistingHeaderLogic) {
            // This mimics the Header component's handleBackPress logic
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(fallbackRoute);
            }
          } else {
            // Default behavior: go back if possible, otherwise go to fallback route
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(fallbackRoute);
            }
          }

          return true; // Prevent default behavior
        } catch (error) {
          console.error("[useHardwareBack] Navigation error:", error);
          // Fallback to settings screen on error
          router.replace("/(tabs)/Settings");
          return true;
        }
      }
    );

    // Cleanup function
    return () => backHandler.remove();
  }, [enabled, onBackPress, fallbackRoute, useExistingHeaderLogic]);
};
