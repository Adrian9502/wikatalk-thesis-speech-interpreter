import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Audio } from "expo-av";
import axios from "axios";
import FormData from "form-data";
import * as Speech from "expo-speech";
import DropDownPicker from "react-native-dropdown-picker";
import {
  DIALECTS,
  LANGUAGE_BACKGROUND,
  LANGUAGE_INFO,
} from "@/constant/languages";

const Home = () => {
  const [upperTextfield, setUpperTextfield] = useState<string>(
    "Tap the mic to start translating your speech."
  );
  const [bottomTextfield, setBottomTextfield] = useState<string>(
    "Tap the mic to start translating your speech."
  );
  const [language1, setLanguage1] = useState<string>("Tagalog");
  const [language2, setLanguage2] = useState<string>("Cebuano");
  const [recording, setRecording] = useState<Audio.Recording | undefined>(
    undefined
  );
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [user, setUser] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [showLanguageInfo, setShowLanguageInfo] = useState<boolean>(false);
  const [activeLanguageInfo, setActiveLanguageInfo] = useState<string>("");
  const [openTopDropdown, setOpenTopDropdown] = useState<boolean>(false);
  const [openBottomDropdown, setOpenBottomDropdown] = useState<boolean>(false);

  // for modal
  const [infoSection, setInfoSection] = useState<"top" | "bottom" | null>(null);

  // Close other dropdown when one opens
  useEffect(() => {
    if (openTopDropdown) {
      setOpenBottomDropdown(false);
    }
  }, [openTopDropdown]);

  useEffect(() => {
    if (openBottomDropdown) {
      setOpenTopDropdown(false);
    }
  }, [openBottomDropdown]);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  useEffect(() => {
    if (loading) {
      console.log("loading..");
    }
  }, [loading]);

  async function stopRecording() {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI();
    console.log("Recording stopped and stored at", uri);
    if (!uri) {
      console.error("No recording URI found");
      return;
    }
  }

  async function translateRecord(srcLang: string, tgtLang: string) {
    const FILEUPLOAD_URL = process.env.EXPO_PUBLIC_NGROK_FILEUPLOAD_URL;
    if (!FILEUPLOAD_URL) {
      console.error("No file upload URL found");
      return;
    }
    const uri = recording?.getURI();
    const formData = new FormData();
    const filetype = uri?.split(".").pop();
    const filename = uri?.split("/").pop();
    setLoading(true);
    formData.append("file", {
      uri: uri,
      type: `audio/${filetype}`,
      name: filename,
    });
    formData.append("tgtLang", tgtLang);
    formData.append("srcLang", srcLang);
    console.log(formData);
    console.log("File upload URL: ", FILEUPLOAD_URL);
    axios
      .post(FILEUPLOAD_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setLoading(false);
        console.log("Response: ", response.data);
        handleTextfield(
          response?.data["translated_text"],
          response?.data["transcribed_text"]
        );
        synthesis(response?.data["translated_text"]);
      })
      .catch((error) => {
        console.log("Error translating record: ", error);
      });
  }

  const synthesis = (text: string, language: string = "fil-PH") => {
    Speech.speak(text, { language: language, rate: 0.75 });
  };

  const handleTextfield = (text1: string, text2: string) => {
    if (user == 1) {
      setUpperTextfield(text1);
      setBottomTextfield(text2);
    } else {
      setUpperTextfield(text2);
      setBottomTextfield(text1);
    }
  };

  const handlePress = async (event: number) => {
    if (event == 1) {
      console.log("Mic 1 pressed!");
      setUser(1);
      if (recording) {
        await stopRecording();
        await translateRecord(language1, language2);
      } else {
        startRecording();
      }
    } else if (event == 2) {
      console.log("Mic 2 pressed!");
      setUser(2);
      if (recording) {
        await stopRecording();
        await translateRecord(language2, language1);
      } else {
        startRecording();
      }
    }
  };

  // Close dropdowns when clicking elsewhere
  const closeDropdowns = () => {
    if (openTopDropdown) setOpenTopDropdown(false);
    if (openBottomDropdown) setOpenBottomDropdown(false);
    setShowLanguageInfo(false);
  };

  // Helper function to show language info modal
  const showInfo = (language: string, section: "top" | "bottom") => {
    setActiveLanguageInfo(language);
    setInfoSection(section);
    setShowLanguageInfo(true);
  };

  // Default fallback image if language not found in mapping
  const getLanguageBackground = (language: string) => {
    return (
      LANGUAGE_BACKGROUND[language] ||
      require("@/assets/images/languages/tagalog-bg.jpg")
    );
  };

  // copy to clipboard
  //  TO BE CONTINUE
  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      // You could add a brief notification here if you want
      console.log("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/ph-flag.jpg")}
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          "rgba(0, 56, 168, 0.85)",
          "rgba(0, 0, 0, 0.6)",
          "rgba(206, 17, 38, 0.85)",
        ]}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <StatusBar style="light" />

          <TouchableOpacity
            activeOpacity={1}
            onPress={closeDropdowns}
            className="flex-1 items-center justify-center w-full px-5"
          >
            {/* Top section  */}
            <View className="w-full h-2/5 mt-2">
              <ImageBackground
                source={getLanguageBackground(language2)}
                className="w-full h-full rounded-2xl overflow-hidden"
                resizeMode="cover"
                imageStyle={{ transform: [{ rotate: "180deg" }] }}
              >
                <LinearGradient
                  colors={["rgba(206, 17, 38, 0.8)", "rgba(206, 17, 38, 0.6)"]}
                  className="w-full h-full"
                >
                  <View className="w-full flex-1 rounded-2xl p-5 relative shadow-lg border border-red-900/30">
                    {/* Language info button */}
                    <TouchableOpacity
                      onPress={() => showInfo(language2, "top")}
                      className="absolute bottom-2 left-2 z-30 bg-yellow-400/20 p-2 rounded-full"
                    >
                      <MaterialCommunityIcons
                        name="information-outline"
                        size={20}
                        color="#FFD700"
                      />
                    </TouchableOpacity>

                    <ScrollView
                      className="flex-1 w-full rotate-180 mt-14 mb-12 rounded-lg bg-black/50 p-3"
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      contentContainerStyle={{
                        paddingBottom: openTopDropdown ? 220 : 0,
                      }}
                    >
                      <Text className="text-yellow-400 font-medium text-xl">
                        {upperTextfield}
                      </Text>
                    </ScrollView>

                    {/* Dropdown for top section */}
                    <View
                      className="absolute bottom-2 right-2 rotate-180"
                      style={{ zIndex: openTopDropdown ? 9999 : 20 }}
                    >
                      <DropDownPicker
                        open={openTopDropdown}
                        value={language2}
                        items={DIALECTS}
                        setOpen={setOpenTopDropdown}
                        setValue={setLanguage2}
                        placeholder="Select language"
                        onOpen={() => setOpenBottomDropdown(false)}
                        listMode="SCROLLVIEW"
                        scrollViewProps={{
                          nestedScrollEnabled: true,
                        }}
                        style={{
                          width: 140,
                          backgroundColor: "#CE1126",
                          borderWidth: 1,
                          borderColor: "#FFD700",
                        }}
                        dropDownContainerStyle={{
                          backgroundColor: "#CE1126",
                          width: 120,
                          borderColor: "#FFD700",
                          position: "relative",
                          top: 0,
                        }}
                        labelStyle={{
                          fontSize: 14,
                          color: "#FFD700",
                          fontWeight: "600",
                        }}
                        textStyle={{
                          fontSize: 14,
                          color: "#FFD700",
                        }}
                        zIndex={5000}
                        zIndexInverse={1000}
                        disableBorderRadius={false}
                        maxHeight={200}
                      />
                    </View>

                    {/* Mic icon */}
                    <View className="absolute top-0 rotate-180 left-0 right-0 flex-row justify-center pb-2">
                      <TouchableOpacity
                        className="w-16 h-16 rounded-full bg-white/20 shadow-md flex items-center justify-center"
                        onPress={() => handlePress(1)}
                      >
                        <FontAwesome5
                          name="microphone"
                          size={32}
                          color="#FFD700"
                        />
                        {recording && user === 1 && (
                          <View className="absolute w-full h-full rounded-full border-2 border-red-500 animate-pulse" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>

            {/* Middle Section - Exchange icon  */}
            <View className="flex-row items-center justify-between w-full my-4 z-10">
              {/* WikaTalk Logo */}
              <View className="flex-row items-center justify-center">
                <Image
                  source={require("@/assets/images/wikatalk-logo-main.png")}
                  className="h-14 w-14"
                  resizeMode="contain"
                />
                <Text className="text-yellow-400 font-eagleLake text-2xl">
                  WikaTalk
                </Text>
              </View>
              {/* Switch icon */}
              <TouchableOpacity
                className="w-16 h-16 rounded-full shadow-xl border-2 border-yellow-400 items-center justify-center"
                onPress={() => {
                  const tempLang = language1;
                  setLanguage1(language2);
                  setLanguage2(tempLang);
                }}
              >
                <LinearGradient
                  colors={["#0038A8", "#CE1126"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="swap-vertical"
                    size={32}
                    color="#FFD700"
                  />
                </LinearGradient>
              </TouchableOpacity>
              {/* WikaTalk Logo */}
              <View className="rotate-180 flex-row items-center justify-center">
                <Image
                  source={require("@/assets/images/wikatalk-logo-main.png")}
                  className="h-14 w-14"
                  resizeMode="contain"
                />
                <Text className="text-yellow-400 font-eagleLake text-2xl">
                  WikaTalk
                </Text>
              </View>
            </View>

            {/* Bottom section */}
            <View className="w-full h-2/5">
              <ImageBackground
                source={getLanguageBackground(language1)}
                className="w-full h-full rounded-2xl overflow-hidden"
                resizeMode="cover"
              >
                <LinearGradient
                  colors={["rgba(0, 56, 168, 0.8)", "rgba(0, 56, 168, 0.6)"]}
                  className="w-full h-full"
                >
                  <View className="w-full flex-1 rounded-2xl p-5 relative shadow-lg border border-blue-900/30">
                    {/* Language info button */}
                    <TouchableOpacity
                      onPress={() => showInfo(language1, "bottom")}
                      className="absolute top-2 right-2 z-30 bg-yellow-400/20 p-2 rounded-full"
                    >
                      <MaterialCommunityIcons
                        name="information-outline"
                        size={20}
                        color="#FFD700"
                      />
                    </TouchableOpacity>

                    {/* Dropdown for bottom section - positioned at top left, not rotated */}
                    <View
                      className="absolute top-2 left-2"
                      style={{ zIndex: openBottomDropdown ? 9999 : 20 }}
                    >
                      <DropDownPicker
                        open={openBottomDropdown}
                        value={language1}
                        items={DIALECTS}
                        setOpen={setOpenBottomDropdown}
                        setValue={setLanguage1}
                        placeholder="Select language"
                        onOpen={() => setOpenTopDropdown(false)}
                        listMode="SCROLLVIEW"
                        scrollViewProps={{
                          nestedScrollEnabled: true,
                        }}
                        style={{
                          width: 140,
                          backgroundColor: "#0038A8",
                          borderWidth: 1,
                          borderColor: "#FFD700",
                        }}
                        dropDownContainerStyle={{
                          backgroundColor: "#0038A8",
                          width: 120,
                          borderColor: "#FFD700",
                          position: "relative",
                          top: 0,
                        }}
                        labelStyle={{
                          fontSize: 14,
                          color: "#FFD700",
                          fontWeight: "600",
                        }}
                        textStyle={{
                          fontSize: 14,
                          color: "#FFD700",
                        }}
                        zIndex={4000}
                        zIndexInverse={2000}
                        disableBorderRadius={false}
                        maxHeight={200}
                      />
                    </View>

                    <ScrollView
                      className="flex-1 w-full mb-14 rounded-lg mt-12 bg-black/50 p-3"
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      contentContainerStyle={{
                        paddingBottom: openBottomDropdown ? 220 : 0,
                      }}
                    >
                      <Text className="text-yellow-400 font-medium text-xl">
                        {bottomTextfield}
                      </Text>
                    </ScrollView>
                    {/* Mic icon */}
                    <View className="absolute bottom-0 left-0 right-0 flex-row justify-center pb-2">
                      <TouchableOpacity
                        className="w-16 h-16 rounded-full bg-white/20 shadow-md flex items-center justify-center"
                        onPress={() => handlePress(2)}
                      >
                        <FontAwesome5
                          name="microphone"
                          size={32}
                          color="#FFD700"
                        />
                        {recording && user === 2 && (
                          <View className="absolute w-full h-full rounded-full border-2 border-red-500 animate-pulse" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>
          </TouchableOpacity>

          {/* Language Information Modal */}
          {showLanguageInfo &&
            activeLanguageInfo &&
            LANGUAGE_INFO[activeLanguageInfo] && (
              <View className="absolute inset-0 flex-1 items-center justify-center bg-black/70">
                <View
                  className={`bg-gray-900 w-4/5 rounded-xl p-5 border border-yellow-400 ${
                    infoSection === "top" ? "rotate-180" : ""
                  }`}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-yellow-400 text-xl font-bold">
                      {activeLanguageInfo} Language
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowLanguageInfo(false);
                        setInfoSection(null);
                      }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={18}
                        color="#FFD700"
                      />
                    </TouchableOpacity>
                  </View>
                  <Image
                    source={getLanguageBackground(activeLanguageInfo)}
                    className="w-full h-40 rounded-lg mb-3"
                    resizeMode="cover"
                  />
                  <View className="space-y-4 p-4 bg-gray-800 rounded-lg shadow-md">
                    {[
                      {
                        label: "Region",
                        value: LANGUAGE_INFO[activeLanguageInfo].region,
                      },
                      {
                        label: "Symbol",
                        value: LANGUAGE_INFO[activeLanguageInfo].symbol,
                      },
                      {
                        label: "Fun Fact",
                        value: LANGUAGE_INFO[activeLanguageInfo].fact,
                      },
                    ].map((item, index) => (
                      <View
                        key={index}
                        className="flex-row flex-wrap items-start"
                      >
                        <Text className="text-yellow-400 font-semibold w-24">
                          {item.label}:
                        </Text>
                        <Text className="text-white flex-1">{item.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

          {/* Loading Indicator */}
          {loading && (
            <View className="absolute inset-0 flex-1 items-center justify-center bg-black/50">
              <View className="bg-gray-900 w-1/2 items-center justify-center p-5 rounded-xl shadow-lg">
                <Text className="text-yellow-400 text-center text-lg mb-3">
                  Translating...
                </Text>
                <ActivityIndicator size="large" color="#FFD700" />
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default Home;
