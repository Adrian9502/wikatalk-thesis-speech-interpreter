import { View, Image, Text } from "react-native";

interface WikaTalkLogoProps {
  rotate?: boolean; // If true, apply a 180-degree rotation
}

const LogoHome: React.FC<WikaTalkLogoProps> = ({ rotate = false }) => {
  return (
    <View
      className={`flex-row items-center justify-center ${
        rotate ? "rotate-180" : ""
      }`}
    >
      <Image
        source={require("@/assets/images/wikatalk-logo-main.png")}
        className="h-14 w-14"
        resizeMode="contain"
      />
      <Text className="text-yellow-400 font-eagleLake text-2xl">WikaTalk</Text>
    </View>
  );
};

export default LogoHome;
