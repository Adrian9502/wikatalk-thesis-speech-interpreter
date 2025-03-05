import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { DIALECTS } from "@/constant/languages";
import getLanguageBackground from "@/utils/getLanguageBackground";
import QuickPhrases from "@/components/QuickPhrases";

type LanguageOption =
  | "Tagalog"
  | "Cebuano"
  | "Hiligaynon"
  | "Ilocano"
  | "Bicol"
  | "Waray"
  | "Pangasinan"
  | "Maguindanao"
  | "Kapampangan"
  | "Bisaya";

interface TranslateTopProps {
  sourceLanguage: string;
  sourceText: string;
  openSource: boolean;
  copiedSource: boolean;
  isSpeaking: boolean;
  updateState: (state: any) => void;
  handleSourceSpeech: () => void;
  copyToClipboard: (text: string, key: "copiedSource" | "copiedTarget") => void;
}

const TranslateTop: React.FC<TranslateTopProps> = ({
  sourceLanguage,
  sourceText,
  openSource,
  copiedSource,
  isSpeaking,
  updateState,
  handleSourceSpeech,
  copyToClipboard,
}) => {
  return (
    <ImageBackground
      source={getLanguageBackground(sourceLanguage)}
      className="flex-1 rounded-2xl overflow-hidden shadow-lg"
      resizeMode="cover"
    >
      <View
        style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
        className="flex-1 items-start justify-start p-4"
      >
        <DropDownPicker
          open={openSource}
          value={sourceLanguage}
          items={DIALECTS}
          setOpen={(val: any) => updateState({ openSource: val })}
          setValue={(val) => {
            updateState({
              sourceLanguage: val(sourceLanguage),
              openSource: false,
            });
          }}
          placeholder="Select source language"
          style={{
            width: 150,
            backgroundColor: "#0038A8",
            borderWidth: 0,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}
          dropDownContainerStyle={{
            backgroundColor: "#ffffff",
            width: 150,
            borderColor: "#0038A8",
            borderWidth: 1,
            borderRadius: 8,
          }}
          labelStyle={{
            fontSize: 16,
            color: "#fff",
            fontWeight: "600",
          }}
          textStyle={{
            fontSize: 16,
            color: "#0038A8",
            fontWeight: "500",
          }}
          zIndex={3000}
          zIndexInverse={1000}
          onClose={() => updateState({ openSource: false })}
          disableBorderRadius={false}
          maxHeight={200}
        />

        <QuickPhrases
          sourceLanguage={sourceLanguage as LanguageOption}
          onSelectPhrase={(text) => updateState({ sourceText: text })}
        />

        <TextInput
          placeholder="Enter text to translate..."
          value={sourceText}
          onChangeText={(text) => updateState({ sourceText: text })}
          multiline
          scrollEnabled
          textAlignVertical="top"
          style={{
            backgroundColor: "rgba(254,242,242,0.5)",
            borderWidth: 1,
            borderColor: "#999",
          }}
          className="flex-1 text-customBlue rounded-xl font-pregular text-lg w-full mt-3 p-3 max-h-52"
        />

        {/* delete, copy and speaker icon */}
        <View className="flex-row gap-6 items-center mt-2">
          <TouchableOpacity
            onPress={() => updateState({ sourceText: "" })}
            disabled={!sourceText}
            className="bg-blue-100 p-2 rounded-full"
          >
            <MaterialIcons
              name="delete"
              size={24}
              color={sourceText ? "#0038A8" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => copyToClipboard(sourceText, "copiedSource")}
            disabled={!sourceText}
            className="bg-blue-100 p-2 rounded-full"
          >
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              {copiedSource ? (
                <Entypo name="check" size={24} color="#28A745" />
              ) : (
                <FontAwesome5
                  name="copy"
                  size={24}
                  color={sourceText ? "#0038A8" : "#666"}
                />
              )}
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSourceSpeech}
            disabled={!sourceText.trim() || isSpeaking}
            className="bg-blue-100 p-2 rounded-full"
          >
            <FontAwesome5
              name="volume-up"
              size={22}
              color={sourceText.trim() && !isSpeaking ? "#0038A8" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default TranslateTop;
