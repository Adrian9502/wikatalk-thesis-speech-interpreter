import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

import { DIALECTS } from "@/constant/languages";
import getLanguageBackground from "@/utils/getLanguageBackground";

interface TranslateBottomProps {
  targetLanguage: string;
  translatedText: string;
  openTarget: boolean;
  copiedTarget: boolean;
  isTranslating: boolean;
  error: string | Error;
  isSpeaking: boolean;
  updateState: (state: any) => void;
  handleTranslatedSpeech: () => void;
  copyToClipboard: (text: string, key: "copiedSource" | "copiedTarget") => void;
}

const TranslateBottom: React.FC<TranslateBottomProps> = ({
  targetLanguage,
  translatedText,
  openTarget,
  copiedTarget,
  isTranslating,
  error,
  isSpeaking,
  updateState,
  handleTranslatedSpeech,
  copyToClipboard,
}) => {
  return (
    <ImageBackground
      source={getLanguageBackground(targetLanguage)}
      className="flex-1 rounded-2xl overflow-hidden shadow-lg"
      resizeMode="cover"
    >
      <View
        style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
        className="flex-1 items-end justify-start p-4"
      >
        <DropDownPicker
          open={openTarget}
          value={targetLanguage}
          items={DIALECTS}
          setOpen={(val: any) => updateState({ openTarget: val })}
          setValue={(val) => {
            updateState({
              targetLanguage: val(targetLanguage),
              openTarget: false,
            });
          }}
          placeholder="Select target language"
          style={{
            width: 150,
            backgroundColor: "#CE1126",
            borderWidth: 0,
            borderRadius: 12,
            alignSelf: "flex-end",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}
          dropDownContainerStyle={{
            backgroundColor: "#ffffff",
            width: 150,
            alignSelf: "flex-end",
            borderColor: "#CE1126",
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
            color: "#CE1126",
            fontWeight: "500",
          }}
          zIndex={2000}
          zIndexInverse={2000}
          onClose={() => updateState({ openSource: false })}
          disableBorderRadius={false}
          maxHeight={200}
        />

        <View className="flex-1 w-full justify-center">
          {isTranslating ? (
            <ActivityIndicator size="large" color="#CE1126" />
          ) : error ? (
            <Text className="text-red-500 font-psemibold">
              {typeof error === "string"
                ? error
                : error.toString() || "An unknown error occurred"}
            </Text>
          ) : (
            <TextInput
              placeholder="Translation will appear here..."
              value={translatedText}
              editable={false}
              multiline
              textAlignVertical="top"
              style={{
                backgroundColor: "rgba(254,242,242,0.5)",
                borderWidth: 1,
                borderColor: "#999",
              }}
              className="flex-1 text-customRed min-h-full  rounded-xl font-pregular text-lg w-full mt-3 p-3 "
            />
          )}
        </View>

        <View className="flex-row w-full gap-6 items-center mt-1">
          <TouchableOpacity
            onPress={() => copyToClipboard(translatedText, "copiedTarget")}
            disabled={!translatedText}
            className="bg-red-100 p-2 rounded-full"
          >
            <Animated.View entering={ZoomIn} exiting={ZoomOut}>
              {copiedTarget ? (
                <Entypo name="check" size={24} color="#28A745" />
              ) : (
                <FontAwesome5
                  name="copy"
                  size={24}
                  color={translatedText ? "#CE1126" : "#666"}
                />
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Show text */}
          <TouchableOpacity
            disabled={!translatedText || isSpeaking}
            onPress={handleTranslatedSpeech}
            className="bg-red-100 p-2 rounded-full"
          >
            <FontAwesome5
              name="volume-up"
              size={22}
              color={translatedText && !isSpeaking ? "#CE1126" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default TranslateBottom;
