import {
  SafeAreaView,
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const Translate = () => {
  const [tagalogText, setTagalogText] = useState("");
  const [bisayaText, setBisayaText] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-emerald-500">
      <StatusBar style="dark" />

      {/* Logo Section */}
      <View style={styles.curvedTopContainer}>
        <Image
          className="w-full"
          source={require("../../assets/images/WikaTalk-small.png")}
          resizeMode="contain"
        />
        <View className="w-full items-center justify-center">
          <Text className="font-pbold z-50 text-[2rem] -mb-6 text-emerald-500 text-center">
            WikaTalk
          </Text>
        </View>
      </View>
      {/* WikaTranslate text */}
      <Text className="text-center font-psemibold text-[2rem] text-white">
        WikaTranslate
      </Text>
      {/* Translation container */}
      <View className="flex-1 relative mx-4 my-4 mb-10 gap-4">
        {/* Top section */}
        <View className="flex-1 items-start justify-center bg-white p-3 rounded-xl">
          {/* Change this to dropdown */}
          <Text className="font-pmedium mb-2 text-xl bg-emerald-500 px-4 py-1 rounded-lg text-white">
            Tagalog
          </Text>
          <TextInput
            placeholder="Type here..."
            value={tagalogText}
            onChangeText={setTagalogText}
            multiline
            textAlignVertical="top"
            className="flex-1  text-emerald-500 font-pregular text-lg w-full"
          />
          {/* make these work */}
          <View className="flex-row gap-4">
            <MaterialIcons name="delete" size={28} color="#10B981" />
            <FontAwesome5 name="volume-up" size={25} color="#10B981" />
          </View>
        </View>
        {/* Mic */}
        <View className="absolute left-1/2 top-1/2 -translate-x-8 -translate-y-8 w-16 h-16 rounded-full border-4 border-emerald-500 bg-white items-center justify-center z-50">
          <View className="p-3 border-4 bg-emerald-500 border-white rounded-full">
            <Image
              source={require("@/assets/images/mic-white.png")}
              className="w-12 h-12"
            />
          </View>
        </View>

        {/* Bottom section */}
        <View className="flex-1 items-end justify-center bg-white p-3 rounded-xl">
          {/* change this to dropdown */}
          <Text className="font-pmedium text-xl mb-2 bg-emerald-500 px-4 py-1 rounded-lg text-white">
            Bisakol
          </Text>
          <TextInput
            placeholder="Type here..."
            value={tagalogText}
            onChangeText={setTagalogText}
            multiline
            textAlignVertical="top"
            className="flex-1  text-emerald-500 font-pregular text-lg w-full"
          />
          {/* make these work */}
          <View className="flex-row w-full gap-4">
            <FontAwesome5 name="copy" size={28} color="#10B981" />
            <FontAwesome5 name="volume-up" size={25} color="#10B981" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// We keep this style since borderBottomRadius with percentage isn't supported in Tailwind
const styles = StyleSheet.create({
  curvedTopContainer: {
    width: Dimensions.get("window").width,
    height: 180,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomLeftRadius: "100%",
    borderBottomRightRadius: "100%",
  },
});

export default Translate;
