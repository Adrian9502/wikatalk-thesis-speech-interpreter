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
  // Check if user is logged in
  useEffect(() => {
    if (isAppReady) {
      if (isLoggedIn) {
        // Small delay to ensure smooth transition
        const timer = setTimeout(() => {
          router.replace("/Home");
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setIsAuthChecking(false);
      }
    }
  }, [isLoggedIn, isAppReady]);

  // Show a loading indicator until the app is ready
  if (!isAppReady) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-emerald-500">
        <StatusBar style="dark" />
        {/* Logo */}
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
          <Text className="font-pregular text-xl text-emerald-500">
            Lorem ipsum dolor amet
          </Text>
        </View>
      </View>
      <View className="py-5 px-16 w-full flex gap-4">
        {isAuthChecking ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.9}
              className="bg-white p-3 rounded-xl"
              onPress={() => router.push("/(auth)/SignIn")}
            >
              <Text className="text-emerald-700 font-pregular text-lg uppercase text-center">
                sign in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              className="bg-white p-3 rounded-xl"
              onPress={() => router.push("/(auth)/SignUp")}
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
