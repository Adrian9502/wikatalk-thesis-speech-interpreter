import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import SettingItem from "@/components/SettingItem";
import Logo from "@/components/AuthLogo";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  // auth context
  const { logout, userData } = useAuth();
  // App settings state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground
        source={require("@/assets/images/philippines-tapestry.jpg")}
        className="flex-1 w-full h-full"
      >
        <StatusBar style="light" />
        <LinearGradient
          colors={["rgba(0, 56, 168, 0.8)", "rgba(206, 17, 38, 0.8)"]}
          className="flex-1 p-"
        >
          <StatusBar style="light" />

          <View className="bg-customRed/80 py-12">
            <View className="items-center mt-4">
              <View className="w-32 h-32 rounded-full bg-customBlue items-center justify-center mb-2 border-4 border-yellow-400">
                {userData?.profilePicture ? (
                  <Image
                    source={{ uri: userData.profilePicture }}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <Text className="text-4xl text-white font-bold">
                    {userData?.fullName?.charAt(0) || "U"}
                  </Text>
                )}
              </View>
              <Text className="text-xl font-bold text-white">
                {userData?.fullName || "User"}
              </Text>
              <Text className="text-white opacity-80">
                {userData?.email || "email@example.com"}
              </Text>
              <TouchableOpacity className="mt-2 bg-white py-1 px-4 rounded-lg">
                <Text className="text-customBlue font-medium">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 bg-gray-100 px-6 pt-6">
            <View className="mb-6">
              <View className="bg-gray-50 rounded-xl p-2">
                <SettingItem
                  icon="bell"
                  label="Notifications"
                  value={notifications}
                  toggleSwitch={() => setNotifications(!notifications)}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                Account
              </Text>
              <View className="bg-gray-50 rounded-xl p-2">
                <SettingItem
                  icon="user-cog"
                  label="Account Details"
                  onPress={() => console.log("Account details pressed")}
                />
                <SettingItem
                  icon="lock"
                  label="Change Password"
                  onPress={() => console.log("Change password pressed")}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                Support
              </Text>
              <View className="bg-gray-50 rounded-xl p-2">
                <SettingItem
                  icon="question-circle"
                  label="Help & FAQ"
                  onPress={() => console.log("Help pressed")}
                />
                <SettingItem
                  icon="comment-alt"
                  label="Contact Support"
                  onPress={() => console.log("Contact support pressed")}
                />
              </View>
            </View>

            <TouchableOpacity
              className="mb-8 mt-4 bg-customRed/80 rounded-xl py-4 items-center"
              onPress={handleLogout}
            >
              <Text className="text-white font-medium">Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Settings;
