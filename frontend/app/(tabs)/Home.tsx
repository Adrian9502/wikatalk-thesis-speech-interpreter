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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
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
import { showToast } from "@/lib/showToast";
import { DIALECTS, LANGUAGE_INFO } from "@/constant/languages";
import getLanguageBackground from "@/utils/getLanguageBackground";

const Home = () => {
  const initialText =
    "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi deserunt voluptatem dolores expedita, distinctio vero nihil libero excepturi... Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi deserunt voluptatem dolores expedita, distinctio vero nihil libero excepturi...Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi deserunt voluptatem dolores expedita, distinctio vero nihil libero excepturi...Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi deserunt voluptatem dolores expedita, distinctio vero nihil libero excepturi...Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi deserunt voluptatem dolores expedita, distinctio vero nihil libero excepturi...Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi deserunt voluptatem dolores expedita, distinctio vero nihil libero excepturi...";

  const [upperTextfield, setUpperTextfield] = useState<string>(initialText);
  const [bottomTextfield, setBottomTextfield] = useState<string>(initialText);
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

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      showToast({
        type: "success",
        title: "Copied!",
        description: "Copied to clipboard!",
      });
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  // Clear text function
  const clearText = (section: "top" | "bottom") => {
    if (section === "top") {
      setUpperTextfield("");
    } else {
      setBottomTextfield("");
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/ph-flag.jpg")}
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
        <SafeAreaView className="h-full py-5">
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
                    <ScrollView
                      // Remove rotate-180 classes
                      className="flex-1 rotate-180 w-full mb-4 rounded-lg bg-black/50 border border-customRed p-3"
                      // Ensure these properties are set correctly
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      // Adjust content container style
                      contentContainerStyle={{
                        flexGrow: 1,
                        minHeight: "100%",
                        // Remove overly restrictive padding
                        paddingBottom: 20, // Or remove this entirely
                      }}
                    >
                      <View className="flex-1 ">
                        <Text
                          numberOfLines={0}
                          className="text-yellow-400 font-medium text-xl"
                        >
                          {upperTextfield}
                        </Text>
                      </View>
                    </ScrollView>
                    <View className="flex-row items-center justify-between w-full rotate-180">
                      {/* Language Dropdown */}
                      <View className="flex-1 mr-4">
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
                            backgroundColor: "#CE1126",
                            borderWidth: 1,
                            borderColor: "#FFD700",
                            borderRadius: 10,
                          }}
                          dropDownContainerStyle={{
                            backgroundColor: "#CE1126",
                            borderColor: "#FFD700",
                            borderRadius: 20,
                          }}
                          labelStyle={{
                            fontSize: 16,
                            color: "#FFD700",
                            fontWeight: "700",
                          }}
                          textStyle={{
                            fontSize: 16,
                            color: "#FFD700",
                          }}
                          maxHeight={200}
                        />
                      </View>

                      {/* Info and Mic Container */}
                      <View className="flex-row items-center">
                        {/* Language info button */}
                        <TouchableOpacity
                          onPress={() => showInfo(language2, "top")}
                          className="bg-yellow-400/20 p-2 rounded-full mr-3"
                        >
                          <MaterialCommunityIcons
                            name="information-outline"
                            size={20}
                            color="#FFD700"
                          />
                        </TouchableOpacity>

                        {/* Copy Icon */}
                        <TouchableOpacity
                          onPress={() => copyToClipboard(upperTextfield)}
                          className="bg-yellow-400/20 p-2 rounded-full mr-2"
                        >
                          <MaterialIcons
                            name="content-copy"
                            size={20}
                            color="#FFD700"
                          />
                        </TouchableOpacity>

                        {/* Delete Icon */}
                        <TouchableOpacity
                          onPress={() => clearText("top")}
                          className="bg-yellow-400/20 p-2 rounded-full mr-3"
                        >
                          <MaterialIcons
                            name="delete-outline"
                            size={20}
                            color="#FFD700"
                          />
                        </TouchableOpacity>

                        {/* Mic icon */}
                        <TouchableOpacity
                          className="w-16 h-16 rounded-full bg-white/20 shadow-md flex items-center justify-center"
                          onPress={() => handlePress(1)}
                        >
                          {/* Animated Pulse Background */}
                          {recording && user === 1 && (
                            <View className="absolute w-full h-full rounded-full bg-emerald-500 animate-pulse" />
                          )}

                          {/* Icon - Ensuring it's on top */}
                          <FontAwesome5
                            name="microphone"
                            size={32}
                            color="#FFD700"
                            style={{ zIndex: 10 }} // Ensures it's on top
                          />
                        </TouchableOpacity>
                      </View>
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
                    <View className="flex-row items-center justify-between w-full">
                      {/* Language Dropdown */}
                      <View className="flex-1 mr-4">
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
                            backgroundColor: "#0038A8",
                            borderWidth: 1,
                            borderColor: "#FFD700",
                            borderRadius: 10,
                          }}
                          dropDownContainerStyle={{
                            backgroundColor: "#0038A8",
                            borderColor: "#FFD700",
                            borderRadius: 20,
                          }}
                          labelStyle={{
                            fontSize: 16,
                            color: "#FFD700",
                            fontWeight: "700",
                          }}
                          textStyle={{
                            fontSize: 16,
                            color: "#FFD700",
                          }}
                          maxHeight={200}
                        />
                      </View>

                      {/* Info and Mic Container */}
                      <View className="flex-row items-center">
                        {/* Copy Icon */}
                        <TouchableOpacity
                          onPress={() => copyToClipboard(bottomTextfield)}
                          className="bg-yellow-400/20 p-2 rounded-full mr-2"
                        >
                          <MaterialIcons
                            name="content-copy"
                            size={20}
                            color="#FFD700"
                          />
                        </TouchableOpacity>

                        {/* Delete Icon */}
                        <TouchableOpacity
                          onPress={() => clearText("bottom")}
                          className="bg-yellow-400/20 p-2 rounded-full mr-3"
                        >
                          <MaterialIcons
                            name="delete-outline"
                            size={20}
                            color="#FFD700"
                          />
                        </TouchableOpacity>
                        {/* Language info button */}
                        <TouchableOpacity
                          onPress={() => showInfo(language1, "bottom")}
                          className="bg-yellow-400/20 p-2 rounded-full mr-3"
                        >
                          <MaterialCommunityIcons
                            name="information-outline"
                            size={20}
                            color="#FFD700"
                          />
                        </TouchableOpacity>

                        {/* Mic icon */}
                        <TouchableOpacity
                          className="w-16 h-16 rounded-full bg-white/20 shadow-md flex items-center justify-center"
                          onPress={() => handlePress(2)}
                        >
                          {recording && user === 2 && (
                            <View className="absolute w-full h-full rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          <FontAwesome5
                            name="microphone"
                            size={32}
                            color="#FFD700"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <ScrollView
                      contentContainerStyle={{
                        flexGrow: 1,
                      }}
                      style={{ maxHeight: "100%" }}
                      className="w-full mt-4 rounded-lg bg-black/50 border border-customBlue p-3"
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                      scrollEnabled={true}
                    >
                      <View className="flex-1">
                        <Text className="text-yellow-400 font-medium text-xl">
                          {upperTextfield}
                        </Text>
                      </View>
                    </ScrollView>
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
