import { Text, View, Image } from "react-native";
import React from "react";

interface LogoProps {
  title?: string;
}
const Logo: React.FC<LogoProps> = ({ title }) => {
  return (
    <View className="items-center justify-center">
      <Image
        source={require("@/assets/images/wikatalk-logo-main.png")}
        className="w-16 h-16"
        resizeMode="contain"
      />
      <Text className="text-white text-xl font-eagleLake">{title}</Text>
    </View>
  );
};

export default Logo;
