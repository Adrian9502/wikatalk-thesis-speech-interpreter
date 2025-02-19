import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Logo from "@/components/Logo";

const Settings = () => {
  // User info state (in a real app, this would come from your auth context or redux)
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    profilePicture: null, // Placeholder for profile image
  });

  // App settings state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);

  // Setting item component for reusability
  const SettingItem = ({ icon, label, value, onPress, toggleSwitch }) => {
    return (
      <TouchableOpacity
        className="flex-row items-center justify-between py-4 border-b border-gray-200"
        onPress={onPress}
      >
        <View className="flex-row items-center">
          <FontAwesome5 name={icon} size={22} color="#10b981" />
          <Text className="ml-4 text-base font-medium text-gray-800">
            {label}
          </Text>
        </View>
        {typeof value === "boolean" ? (
          <Switch
            value={value}
            onValueChange={toggleSwitch}
            trackColor={{ false: "#d1d5db", true: "#10b981" }}
            thumbColor={Platform.OS === "ios" ? undefined : "#fff"}
          />
        ) : (
          <View className="flex-row items-center">
            {value && <Text className="mr-2 text-gray-600">{value}</Text>}
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="#9ca3af"
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => console.log("Logged out"),
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
            {userInfo.profilePicture ? (
              <Image
                source={{ uri: userInfo.profilePicture }}
                className="w-full h-full rounded-full"
              />
            ) : (
              <Text className="text-4xl text-white font-bold">
                {userInfo.name.charAt(0)}
              </Text>
            )}
          </View>
          <Text className="text-xl font-bold text-white">{userInfo.name}</Text>
          <Text className="text-white opacity-80">{userInfo.email}</Text>
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
