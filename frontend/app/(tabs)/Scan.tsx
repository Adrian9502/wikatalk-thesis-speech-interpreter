import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DropDownPicker from "react-native-dropdown-picker";
import { DIALECTS, LANGUAGE_BACKGROUND } from "@/app/constant/languages";
import Logo from "@/app/components/Logo";
const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedLanguage, setSelectedLanguage] = useState("Tagalog");
  const [translatedText, setTranslatedText] = useState("");
  const [open, setOpen] = useState<boolean>(false);

  const getLanguageBackground = (language: string) => {
    return (
      LANGUAGE_BACKGROUND[language] ||
      require("@/assets/images/languages/tagalog-bg.jpg")
    );
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView className="flex-1 bg-emerald-500">
        <StatusBar style="dark" />
        <Logo title="WikaScan" />
        <View className="items-center justify-center h-1/2">
          <Text className="text-center font-pmedium text-white pb-2">
            We need your permission to show the camera
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={requestPermission}
            className="p-3 bg-white rounded-xl"
          >
            <Text className="text-customBlue font-psemibold">
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={getLanguageBackground(selectedLanguage)}
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={[
          "rgba(0, 56, 168, 0.85)",
          "rgba(0, 0, 0, 0.6)",
          "rgba(206, 17, 38, 0.85)",
        ]}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 pt-12">
          {/* Camera container */}
          <View className="flex-1 ">
            <View className="h-1/2 mx-4 mt-2 rounded-2xl overflow-hidden border-2 border-white">
              <CameraView style={styles.camera} facing="back"></CameraView>
            </View>
            {/* Results and language selection */}
            <View className="flex-1 mx-4 my-2 bg-white/80 rounded-xl p-4 elevation">
              <View className="flex-row items-center justify-between mb-2">
                <DropDownPicker
                  open={open}
                  value={selectedLanguage}
                  items={DIALECTS}
                  setOpen={setOpen}
                  setValue={setSelectedLanguage}
                  placeholder="Select a language"
                  style={{
                    width: 150,
                    backgroundColor: "#fff",
                    borderWidth: 2,
                    borderColor: "#0038A8",
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#0038A8",
                  }}
                  labelStyle={{
                    fontSize: 16,
                    color: "#0038A8",
                    fontWeight: "600",
                  }}
                  textStyle={{
                    fontSize: 16,
                    color: "#0038A8",
                  }}
                  listItemContainerStyle={{
                    height: 35,
                    justifyContent: "center",
                    paddingVertical: 0,
                  }}
                  listItemLabelStyle={{
                    fontSize: 16,
                    color: "#0038A8",
                  }}
                  itemSeparator={true}
                  itemSeparatorStyle={{
                    backgroundColor: "#0038A8",
                    height: 1,
                  }}
                  dropDownDirection="BOTTOM"
                />
              </View>
              {/* result text container */}
              <View className="flex-1 p-2">
                <Text className="text-xl font-pmedium text-customBlue">
                  {translatedText || "No translation yet"}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default Scan;

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  picker: {
    flex: 1,
    alignItems: "center",
    color: "#CE1126",
    fontWeight: 600,
    borderWidth: 2,
    height: 50,
  },
});
