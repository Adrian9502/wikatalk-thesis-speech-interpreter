import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import React from "react";

interface LogoProps {
  title: string;
}
const Logo: React.FC<LogoProps> = ({ title }) => {
  return (
    <>
      {/* Logo Section */}
      <View style={styles.curvedTopContainer}>
        <Image
          className="w-full"
          source={require("../assets/images/WikaTalk-small.png")}
          resizeMode="contain"
        />
        <View className="w-full items-center justify-center">
          <Text
            style={styles.text}
            className="font-pbold z-50  -mb-6 text-emerald-500 text-center"
          >
            WikaTalk
          </Text>
        </View>
      </View>
      {/* WikaScan text */}
      <Text
        style={styles.text}
        className="text-center font-psemibold text-white"
      >
        {title}
      </Text>
    </>
  );
};

export default Logo;

const styles = StyleSheet.create({
  curvedTopContainer: {
    width: Dimensions.get("window").width,
    height: 150,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomLeftRadius: "100%",
    borderBottomRightRadius: "100%",
  },
  text: {
    fontSize: 32,
  },
});
