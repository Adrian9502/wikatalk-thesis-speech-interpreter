import React, { useEffect, useState, ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InteractionManager, View, ActivityIndicator } from "react-native";
import { useSplashStore } from "@/store/useSplashStore";
import DotsLoader from "./DotLoader";

interface ProtectedRouteProps {
  authRequired: boolean;
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  authRequired,
  children,
}) => {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const { isAppReady } = useAuthStore();
  const { isLoadingComplete } = useSplashStore();

  useEffect(() => {
    // Only check auth if the app is ready
    if (isAppReady) {
      const checkAuth = async () => {
        try {
          const token = await AsyncStorage.getItem("userToken");

          // Determine if we need to redirect
          if (authRequired && !token) {
            console.log("Auth required but no token, redirecting to login");
            await InteractionManager.runAfterInteractions(() => {
              router.replace("/");
            });
          } else if (!authRequired && token) {
            console.log("Already authenticated, redirecting to app");
            await InteractionManager.runAfterInteractions(() => {
              // FIXED: Navigate directly to Home tab route
              router.replace("/(tabs)/Home");
            });
          }

          // Add a small delay to ensure smooth transition
          setTimeout(() => {
            setIsChecking(false);
          }, 300);
        } catch (error) {
          console.error("Auth check error:", error);
          setIsChecking(false);
        }
      };

      checkAuth();
    }
  }, [authRequired, isAppReady]);

  // If app is still loading, show nothing (splash is handled at root level)
  if (!isAppReady || isChecking) {
    // Only show a minimal loading indicator if the splash has already been shown
    if (isLoadingComplete) {
      return (
        <View
          style={{
            backgroundColor: "#0a0f28",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DotsLoader />
        </View>
      );
    }
    // Return empty fragment - the splash is handled by RootLayout
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
