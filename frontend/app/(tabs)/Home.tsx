import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LANGUAGE_INFO } from "@/constant/languages";
import getLanguageBackground from "@/utils/getLanguageBackground";
import SwapButton from "@/components/SwapButton";
import LogoHome from "@/components/home/LogoHome";
import { useRecordingTranslation } from "@/hooks/useRecordingTranslation";
import { useRecording } from "@/hooks/useRecording";
import LanguageSection from "@/components/home/LanguageSection";
const Home = () => {
  // Constants
  const initialText = "Press the mic icon to start recording. Press again to";

  // Custom hooks
  const { recording, startRecording, stopRecording } = useRecording();
  const { loading, translateAudio, speakText } = useRecordingTranslation();

  // Language states
  const [language1, setLanguage1] = useState<string>("Tagalog");
  const [language2, setLanguage2] = useState<string>("Cebuano");

  // Text states
  const [upperTextfield, setUpperTextfield] = useState<string>(initialText);
  const [bottomTextfield, setBottomTextfield] = useState<string>(initialText);

  // UI states
  const [user, setUser] = useState<number>(1);
  const [showLanguageInfo, setShowLanguageInfo] = useState<boolean>(false);
  const [activeLanguageInfo, setActiveLanguageInfo] = useState<string>("");
  const [openTopDropdown, setOpenTopDropdown] = useState<boolean>(false);
  const [openBottomDropdown, setOpenBottomDropdown] = useState<boolean>(false);
  const [infoSection, setInfoSection] = useState<"top" | "bottom" | null>(null);

  // Close other dropdown when one opens
  useEffect(() => {
    if (openTopDropdown) setOpenBottomDropdown(false);
  }, [openTopDropdown]);

  useEffect(() => {
    if (openBottomDropdown) setOpenTopDropdown(false);
  }, [openBottomDropdown]);

  // Handle text field updates based on user
  const handleTextfield = (translatedText: string, transcribedText: string) => {
    if (user === 1) {
      setUpperTextfield(translatedText);
      setBottomTextfield(transcribedText);
    } else {
      setUpperTextfield(transcribedText);
      setBottomTextfield(translatedText);
    }
  };

  // Handle microphone press
  const handlePress = async (userNum: number) => {
    setUser(userNum);

    if (recording) {
      const uri = await stopRecording();
      if (uri) {
        const sourceLang = userNum === 1 ? language1 : language2;
        const targetLang = userNum === 1 ? language2 : language1;

        const result = await translateAudio(uri, sourceLang, targetLang);
        if (result) {
          handleTextfield(result.translatedText, result.transcribedText);
          speakText(result.translatedText);
        }
      }
    } else {
      startRecording();
    }
  };

  // UI helper functions
  const closeDropdowns = () => {
    setOpenTopDropdown(false);
    setOpenBottomDropdown(false);
    setShowLanguageInfo(false);
  };

  const showInfo = (language: string, section: "top" | "bottom") => {
    setActiveLanguageInfo(language);
    setInfoSection(section);
    setShowLanguageInfo(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  const clearText = (section: "top" | "bottom") => {
    section === "top" ? setUpperTextfield("") : setBottomTextfield("");
  };

  const handleSwapLanguage = () => {
    setLanguage1(language2);
    setLanguage2(language1);
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
        <SafeAreaView className="flex-1 " edges={["top", "left", "right"]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeDropdowns}
            className="flex-1 items-center justify-center w-full px-5"
          >
            {/* Top section  */}
            <LanguageSection
              position="top"
              language={language2}
              setLanguage={setLanguage2}
              textField={upperTextfield}
              dropdownOpen={openTopDropdown}
              setDropdownOpen={setOpenTopDropdown}
              closeOtherDropdown={() => setOpenBottomDropdown(false)}
              getLanguageBackground={getLanguageBackground}
              showInfo={showInfo}
              copyToClipboard={copyToClipboard}
              clearText={clearText}
              handlePress={handlePress}
              recording={recording}
              user={user}
              userId={1}
              controlsPosition="bottom"
            />

            {/* Middle Section - Exchange icon  */}
            <View className="flex-row items-center justify-between w-full my-4 z-10">
              {/* WikaTalk Logo */}
              <LogoHome />
              {/* Switch icon */}
              <SwapButton
                onPress={handleSwapLanguage}
                colors={["#0038A8", "#CE1126"]}
                borderStyle={{
                  borderWidth: 2,
                  borderColor: "#FACC15",
                }}
                iconColor={"#FFD700"}
              />
              {/* WikaTalk Logo */}
              <LogoHome rotate={true} />
            </View>

            {/* Bottom section */}
            <LanguageSection
              position="bottom"
              language={language1}
              setLanguage={setLanguage1}
              textField={bottomTextfield}
              dropdownOpen={openBottomDropdown}
              setDropdownOpen={setOpenBottomDropdown}
              closeOtherDropdown={() => setOpenTopDropdown(false)}
              getLanguageBackground={getLanguageBackground}
              showInfo={showInfo}
              copyToClipboard={copyToClipboard}
              clearText={clearText}
              handlePress={handlePress}
              recording={recording}
              user={user}
              userId={2}
              controlsPosition="top"
            />
          </TouchableOpacity>

          {/* //! WILL BE REPLACE WITH LanguageInfoModal.TSX */}

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
