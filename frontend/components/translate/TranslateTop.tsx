import React from "react";
import { View, TextInput, ImageBackground } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { LanguageOption } from "@/types/types";
import { DIALECTS } from "@/constant/languages";
import getLanguageBackground from "@/utils/getLanguageBackground";
import QuickPhrases from "@/components/translate/QuickPhrases";
import ActionIcons from "./ActionIcons";

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
  // clear input
  const handleClearSourceText = () => {
    updateState({ sourceText: "" });
  };

  return (
    <ImageBackground
      source={getLanguageBackground(sourceLanguage)}
      className="flex-1 rounded-2xl overflow-hidden shadow-lg"
      resizeMode="cover"
    >
      <View
        style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
        className="flex-1 p-4"
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
        <ActionIcons
          text={sourceText}
          handleClearText={handleClearSourceText}
          copyToClipboard={copyToClipboard}
          handleSpeech={handleSourceSpeech}
          copied={copiedSource}
          isSpeaking={isSpeaking}
          showDelete={true}
          copyKey="copiedSource"
          animationType="fade"
          primaryColor="#0038A8"
        />
      </View>
    </ImageBackground>
  );
};

export default TranslateTop;
