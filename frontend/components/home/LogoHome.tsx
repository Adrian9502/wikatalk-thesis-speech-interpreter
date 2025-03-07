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
        style={{ width: 56, height: 56 }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontFamily: "EagleLake",
          color: "#facc15",
          fontSize: 18,
        }}
      >
        WikaTalk
      </Text>
    </View>
  );
};
export default LogoHome;
