import { View, Image, Text, StyleSheet } from "react-native";

const WikaTalkLogo = () => {
  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image
        source={require("@/assets/images/wikatalk-logo-main.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* App Name */}
      <Text style={styles.text}>WikaTalk</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 146,
    height: 146,
  },
  text: {
    marginTop: 16,
    fontSize: 40,
    color: "white",
    fontFamily: "EagleLake",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});

export default WikaTalkLogo;
