import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  Pressable,
  View,
  SafeAreaView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import DIALECTS from "@/constant/languages";
import Logo from "@/components/Logo";
const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedLanguage, setSelectedLanguage] = useState("Tagalog");
  const [translatedText, setTranslatedText] = useState("");
  const [open, setOpen] = useState<boolean>(false);

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
            <Text className="text-emerald-500 font-psemibold">
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-emerald-500">
      <StatusBar style="dark" />
      <Logo title="WikaScan" />
      {/* Camera container */}
      <View className="h-[40%] mx-4 rounded-2xl overflow-hidden border-2 border-white">
        <CameraView style={styles.camera} facing="back"></CameraView>
      </View>

      {/* Results and language selection */}
      <View className="flex-1 mx-4 my-2 bg-white rounded-xl p-2 elevation">
        <View className="flex-row items-center justify-between mb-2">
          <View className="px-2 py-1 bg-emerald-500 rounded-xl items-center justify-center">
            <Text className="font-pmedium text-lg text-white">Result</Text>
          </View>
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
                backgroundColor: "#fff",
                borderWidth: 2,
                borderColor: "#10b981",
              }}
              dropDownContainerStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#10b981",
              }}
              labelStyle={{
                fontSize: 16,
                color: "#10b981",
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
        </View>
        {/* result text container */}
        <View className="flex-1 p-2">
          <Text className="text-xl font-pmedium text-emerald-600">
            {translatedText || "No translation yet"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
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
    color: "#10b981",
    fontWeight: 600,
    borderWidth: 2,
    height: 50,
  },
});
