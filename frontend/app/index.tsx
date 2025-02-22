import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function Index() {
  const { isLoggedIn, isAppReady } = useAuth();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      if (isAppReady && mounted) {
        // Add small delay to ensure layout is mounted
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (isLoggedIn) {
          router.replace("/(tabs)/Home");
        } else {
          setIsAuthChecking(false);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [isAppReady, isLoggedIn]);

  const handleNavigation = async (route: string) => {
    if (isNavigating) return;

    setIsNavigating(true);
    try {
      // Add small delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));
      await router.push(route as any);
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  // Show loading screen while app is initializing
  if (!isAppReady) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-emerald-500">
        <StatusBar style="dark" />
        <Logo />
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-emerald-500 h-screen relative flex items-center justify-around flex-1">
      <StatusBar style="dark" />
      <View className="absolute -top-[50vh] w-[140vw] rounded-full h-[100vh] bg-white" />
      <View className="w-full flex items-center justify-center">
        <Image
          className="w-full"
          source={require("../assets/images/WikaTalk-logo.png")}
          resizeMode="contain"
        />
        <View className="w-full items-center justify-center">
          <Text className="font-pbold z-50 text-[3rem] text-emerald-500 text-center">
            WikaTalk
          </Text>
          <Text className="font-psemibold text-xl text-emerald-500">
            Speak Freely, Understand Instantly.
          </Text>
        </View>
      </View>
      <View className="py-5 px-16 w-full flex gap-4">
        {isAuthChecking || isNavigating ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.9}
              className="bg-white p-3 rounded-xl"
              onPress={() => handleNavigation("/(auth)/SignIn")}
              disabled={isNavigating}
            >
              <Text className="text-emerald-700 font-pregular text-lg uppercase text-center">
                sign in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              className="bg-white p-3 rounded-xl"
              onPress={() => handleNavigation("/(auth)/SignUp")}
              disabled={isNavigating}
            >
              <Text className="text-emerald-700 font-pregular text-lg uppercase text-center">
                sign up
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
