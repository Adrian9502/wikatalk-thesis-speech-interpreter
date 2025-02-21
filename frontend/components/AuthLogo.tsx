import { StyleSheet, Text, View, Dimensions, Image } from "react-native";
import React from "react";

const AuthLogo = () => {
  return (
    <View style={styles.curvedTopContainer}>
      <Image
        className="w-full"
        source={require("@/assets/images/WikaTalk-logo.png")}
        resizeMode="contain"
      />
      <View className="w-full items-center justify-center">
        <Text className="font-pbold z-50 text-[3rem] -mb-6 text-emerald-500 text-center">
          WikaTalk
        </Text>
        <Text className="font-pregular text-xl text-emerald-500">
          Lorem ipsum dolor amet
        </Text>
      </View>
    </View>
  );
};
export default AuthLogo;

const styles = StyleSheet.create({
  curvedTopContainer: {
    width: Dimensions.get("window").width,
    height: 350,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomLeftRadius: "100%",
    borderBottomRightRadius: "100%",
  },
});
