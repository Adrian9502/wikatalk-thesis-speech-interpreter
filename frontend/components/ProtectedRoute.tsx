// components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashAnimation from "@/components/SplashAnimation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  authRequired?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  authRequired = true,
}) => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const isAuthenticated = !!token;

        setAuthenticated(isAuthenticated);

        // Redirect based on auth status
        if (authRequired && !isAuthenticated) {
          router.replace("/");
        } else if (!authRequired && isAuthenticated) {
          router.replace("/(tabs)/Speech");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [authRequired]);

  // Only render children if the auth state matches what's required
  if ((authRequired && authenticated) || (!authRequired && !authenticated)) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return <SplashAnimation />;
};

export default ProtectedRoute;
