import { View, Image, Text, StyleSheet } from "react-native";

interface WikaTalkLogoProps {
  rotate?: boolean; // If true, apply a 180-degree rotation
}

const LogoHome: React.FC<WikaTalkLogoProps> = ({ rotate = false }) => {
  return (
    <View style={[styles.container, rotate && styles.rotated]}>
      <Image
        source={require("@/assets/images/wikatalk-logo-main.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.text}>WikaTalk</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rotated: {
    transform: [{ rotate: "180deg" }],
  },
  logo: {
    width: 56,
    height: 56,
  },
  text: {
    fontFamily: "EagleLake",
    color: "#facc15",
    fontSize: 18,
  },
});

export default LogoHome;
