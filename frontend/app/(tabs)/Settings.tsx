import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import SettingItem from "@/components/SettingItem";
import Logo from "@/components/Logo";
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
            // The navigation will be handled by the AuthContext
          } catch (error) {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style={darkMode ? "light" : "dark"} />

      <View className="bg-emerald-500 pb-10">
        <Logo title="" />
        <View className="items-center mt-4">
          <View className="w-24 h-24 rounded-full bg-emerald-300 items-center justify-center mb-2 border-4 border-white">
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
          <TouchableOpacity className="mt-2 bg-white py-1 px-4 rounded-full">
            <Text className="text-emerald-500 font-medium">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 mt-6">
        <View className="mb-6">
          <View className="bg-gray-50 rounded-xl p-2">
            <SettingItem
              icon="moon"
              label="Dark Mode"
              value={darkMode}
              toggleSwitch={() => setDarkMode(!darkMode)}
            />
            <SettingItem
              icon="bell"
              label="Notifications"
              value={notifications}
              toggleSwitch={() => setNotifications(!notifications)}
            />
            <SettingItem
              icon="history"
              label="Save History"
              value={saveHistory}
              toggleSwitch={() => setSaveHistory(!saveHistory)}
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
          className="mb-8 mt-4 bg-red-100 rounded-xl py-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-red-600 font-medium">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
