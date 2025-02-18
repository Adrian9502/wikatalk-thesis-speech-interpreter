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
import DropDownPicker from "react-native-dropdown-picker";
import DIALECTS from "@/constant/dialects";
import Logo from "@/components/Logo";
const Translate = () => {
  const [tagalogText, setTagalogText] = useState("");
  const [bisayaText, setBisayaText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Tagalog");
  const [translatedText, setTranslatedText] = useState("");
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SafeAreaView className="flex-1 bg-emerald-500">
      <StatusBar style="dark" />

      {/* Logo */}
      <Logo title="WikaTranslate" />

      {/* Translation container */}
      <View className="flex-1 relative mx-4 my-4 mb-10 gap-4">
        {/* Top section */}
        <View className="flex-1 items-start justify-center bg-white p-3 rounded-xl">
          {/* Change this to dropdown */}
          <View>
            <DropDownPicker
              open={open}
              value={selectedLanguage}
              items={DIALECTS}
              setOpen={setOpen}
              setValue={setSelectedLanguage}
              placeholder="Select a language"
              style={{
                width: 150,
                backgroundColor: "#10b981",
                borderWidth: 2,
                borderColor: "#10b981",
              }}
              dropDownContainerStyle={{
                backgroundColor: "#ffffff",
                width: 150,
                borderColor: "#10b981",
              }}
              labelStyle={{
                fontSize: 16,
                color: "#fff",
                fontWeight: "600",
              }}
              textStyle={{
                fontSize: 16,
                color: "#10b981",
              }}
              listItemContainerStyle={{
                height: 35,
                justifyContent: "center",
                paddingVertical: 0,
              }}
              listItemLabelStyle={{
                fontSize: 16,
                color: "#10b981",
              }}
              itemSeparator={true} // Optional: shows separators between items
              itemSeparatorStyle={{
                backgroundColor: "#10b981", // Optional separator color
                height: 1,
              }}
              dropDownDirection="BOTTOM" // Optional: makes dropdown open downwards
            />
          </View>
          <TextInput
            placeholder="Type here..."
            value={tagalogText}
            onChangeText={setTagalogText}
            multiline
            textAlignVertical="top"
            className="flex-1 text-emerald-500 font-pregular text-lg w-full"
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
          <View>
            <DropDownPicker
              open={open}
              value={selectedLanguage}
              items={DIALECTS}
              setOpen={setOpen}
              setValue={setSelectedLanguage}
              placeholder="Select a language"
              style={{
                width: 150,
                backgroundColor: "#10b981",
                borderWidth: 2,
                borderColor: "#fff",
              }}
              dropDownContainerStyle={{
                backgroundColor: "#ffffff",
                width: 150,
                borderColor: "#10b981",
              }}
              labelStyle={{
                fontSize: 16,
                color: "#fff",
                fontWeight: "600",
              }}
              textStyle={{
                fontSize: 16,
                color: "#10b981",
              }}
              listItemContainerStyle={{
                height: 35,
                justifyContent: "center",
                paddingVertical: 0,
              }}
              listItemLabelStyle={{
                fontSize: 16,
                color: "#10b981",
              }}
              itemSeparator={true} // Optional: shows separators between items
              itemSeparatorStyle={{
                backgroundColor: "#10b981", // Optional separator color
                height: 1,
              }}
              dropDownDirection="BOTTOM" // Optional: makes dropdown open downwards
            />
          </View>
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
