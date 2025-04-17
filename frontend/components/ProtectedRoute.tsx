import React, { useEffect, useState, ReactNode } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InteractionManager } from "react-native";
import SplashAnimation from "@/components/SplashAnimation";

interface ProtectedRouteProps {
  authRequired: boolean;
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  authRequired,
  children,
}) => {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setHasToken(!!token);

        // Set redirect flag and path, but don't navigate yet
        if (authRequired && !token) {
          console.log("Auth required but no token, will redirect to login");
          setShouldRedirect(true);
          setRedirectPath("/");
        } else if (!authRequired && token) {
          console.log("Already authenticated, will redirect to app");
          setShouldRedirect(true);
          setRedirectPath("/(tabs)/Speech");
        } else {
          setShouldRedirect(false);
        }

        setIsChecking(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [authRequired]);

  // Separate effect for navigation
  useEffect(() => {
    if (!isChecking && shouldRedirect && redirectPath) {
      // Wait for next frame and ensure interactions are complete
      const navigationTimer = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          console.log(`Now navigating to: ${redirectPath}`);
          router.replace(redirectPath);
        });
      }, 300);

      return () => clearTimeout(navigationTimer);
    }
  }, [isChecking, shouldRedirect, redirectPath]);

  if (isChecking) {
    return <SplashAnimation />;
  }

  // Either we need auth and have token, or don't need auth and no token
  if ((authRequired && hasToken) || (!authRequired && !hasToken)) {
    return <>{children}</>;
  }

  // This is a fallback while navigation happens
  return <SplashAnimation />;
};

export default ProtectedRoute;
