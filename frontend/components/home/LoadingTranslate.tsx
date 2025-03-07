import { View, Text, ActivityIndicator } from "react-native";
import React from "react";

const LoadingTranslate = () => {
  return (
    <View className="absolute inset-0 flex-1 items-center justify-center bg-black/50">
      <View className="bg-gray-900 w-1/2 items-center justify-center p-5 rounded-xl shadow-lg">
        <Text className="text-yellow-400 text-center text-lg mb-3">
          Translating...
        </Text>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    </View>
  );
};

export default LoadingTranslate;
