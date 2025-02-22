import React from "react";
import { SafeAreaView, Text, View, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import AuthLogo from "@/components/AuthLogo";
import styles from "@/utils/AuthStyles";
const CheckEmail: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View className="flex-1 justify-center items-center px-8">
        <AuthLogo />
        <View className="py-5 px-16 w-full gap-4 mt-6">
          <Text className="text-4xl mb-6 text-center font-pbold text-white">
            Check Your Email
          </Text>
          <Text className="text-white text-center mb-4 font-pregular">
            We've sent you an email with a link to reset your password.
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            className="bg-white p-3 mt-5 rounded-xl"
            onPress={() => router.push("/SignIn")}
          >
            <Text className="text-emerald-500 font-pmedium text-lg uppercase text-center">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CheckEmail;
