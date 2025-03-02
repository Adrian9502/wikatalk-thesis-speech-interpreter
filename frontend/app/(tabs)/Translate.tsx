import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import React, { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { StatusBar } from "expo-status-bar";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DropDownPicker from "react-native-dropdown-picker";
import DIALECTS from "@/constant/languages";
import Logo from "@/components/Logo";

// Define types for language options
type LanguageOption =
  | "Tagalog"
  | "Cebuano"
  | "Hiligaynon"
  | "Ilocano"
  | "Bikol"
  | "Waray"
  | "Pangasinan"
  | "Kapampangan"
  | "English";

// Define interface for language code mapping
interface LanguageCodeMap {
  [key: string]: string;
}

const Translate = () => {
  // State with typed values
  const [sourceText, setSourceText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] =
    useState<LanguageOption>("Tagalog");
  const [targetLanguage, setTargetLanguage] =
    useState<LanguageOption>("Cebuano");
  const [openSource, setOpenSource] = useState<boolean>(false);
  const [openTarget, setOpenTarget] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  // API KEY FOR TRANSLATION
  const api_key = process.env.EXPO_PUBLIC_TRANSLATE_API_KEY;
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const sys_instruct = "You are a translator. Translate the phrases only.";
  const genAI = new GoogleGenerativeAI(api_key);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: sys_instruct,
  });

  // Map language codes for Speech
  const getLanguageCodeForSpeech = (language: LanguageOption): string => {
    const languageMap: LanguageCodeMap = {
      Tagalog: "fil",
      Cebuano: "fil",
      Hiligaynon: "fil",
      Ilocano: "fil",
      Bikol: "fil",
      Waray: "fil",
      Pangasinan: "fil",
      Kapampangan: "fil",
      English: "en-US",
    };

    return languageMap[language] || "en-US";
  };

  const handleSpeech = async (
    text: string,
    language: LanguageOption
  ): Promise<void> => {
    if (!text.trim()) return;

    try {
      const isSpeakingNow = await Speech.isSpeakingAsync();
      if (isSpeakingNow) {
        await Speech.stop();
        setIsSpeaking(false);
      }

      setIsSpeaking(true);
      const langCode = getLanguageCodeForSpeech(language);

      await Speech.speak(text, {
        language: langCode,
        rate: 0.8,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onError: (error: Error) => {
          console.error("Speech error:", error);
          setIsSpeaking(false);
          Alert.alert(
            "Speech Error",
            "Unable to speak the text. Please try again."
          );
        },
      });
    } catch (error) {
      console.error("Speech error:", error);
      setIsSpeaking(false);
      Alert.alert("Error", "Failed to speak the text. Please try again.");
    }
  };
  // Handle source speech
  const handleSourceSpeech = useCallback((): void => {
    handleSpeech(sourceText, sourceLanguage);
  }, [sourceText, sourceLanguage]);
  //  Handle translated speech
  const handleTranslatedSpeech = useCallback((): void => {
    handleSpeech(translatedText, targetLanguage);
  }, [translatedText, targetLanguage]);

  // Stop speech when changing languages
  useEffect(() => {
    const stopSpeech = async (): Promise<void> => {
      const isSpeakingNow = await Speech.isSpeakingAsync();
      if (isSpeakingNow) {
        await Speech.stop();
        setIsSpeaking(false);
      }
    };

    stopSpeech();
  }, [sourceLanguage, targetLanguage]);

  // Handle translation
  const handleTranslation = async (): Promise<void> => {
    if (!sourceText.trim()) {
      setTranslatedText("");
      setError("");
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setTranslatedText(sourceText);
      return;
    }

    setIsTranslating(true);
    setError("");

    try {
      console.log(
        `Translating from ${sourceLanguage} to ${targetLanguage}: "${sourceText}"`
      );

      const prompt = `"Translate the phrase from ${sourceLanguage} to ${targetLanguage}: ${sourceText}"`;

      const result = await model.generateContent(prompt);
      console.log("Raw response:", result.response.text());

      const translated = result.response.text().replace(prompt, "").trim();

      setTranslatedText(translated);
    } catch (error) {
      setError(
        typeof error === "string"
          ? error
          : (error as Error).message || "Translation failed"
      );
    } finally {
      setIsTranslating(false);
    }
  };

  // Create a debounced version of handleTranslation
  const debouncedTranslate = useCallback(
    debounce(() => {
      if (sourceText.trim()) {
        handleTranslation();
      }
    }, 1000),
    [sourceText, sourceLanguage, targetLanguage]
  );

  // Trigger translation when inputs change
  useEffect(() => {
    if (sourceText.trim()) {
      debouncedTranslate();
    } else {
      setTranslatedText("");
    }

    return () => {
      debouncedTranslate.cancel();
    };
  }, [sourceText, sourceLanguage, targetLanguage, debouncedTranslate]);

  // Handle language swap
  const handleSwapLanguages = (): void => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // Handle copy to clipboard
  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await Clipboard.setString(text);
      Alert.alert("Copied!", "Text copied to clipboard.");
    } catch (error) {
      Alert.alert("Error", "Failed to copy text.");
    }
  };
  return (
    <View className="h-screen bg-emerald-500">
      <StatusBar style="dark" />
      <Logo title="WikaTranslate" />

      {/* Translation container */}
      <View className="flex-1 relative mx-4 mb-10 gap-4">
        {/* Source language section */}
        <View className="flex-1 items-start justify-start bg-white p-3 rounded-xl">
          <DropDownPicker
            open={openSource}
            value={sourceLanguage}
            items={DIALECTS}
            setOpen={setOpenSource}
            setValue={setSourceLanguage}
            placeholder="Select source language"
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
            zIndex={3000}
            zIndexInverse={1000}
            onClose={() => setOpenSource(false)}
            disableBorderRadius={false}
            maxHeight={200}
          />

          <TextInput
            placeholder="Enter text to translate..."
            value={sourceText}
            onChangeText={setSourceText}
            multiline
            textAlignVertical="top"
            className="flex-1 text-emerald-500 font-pregular text-lg w-full mt-2 p-2"
          />

          <View className="flex-row gap-4 items-center">
            <TouchableOpacity onPress={() => setSourceText("")}>
              <MaterialIcons name="delete" size={28} color="#10B981" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSourceSpeech}
              disabled={!sourceText.trim() || isSpeaking}
            >
              <FontAwesome5
                name="volume-up"
                size={25}
                color={sourceText.trim() && !isSpeaking ? "#10B981" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Language swap button */}
        <TouchableOpacity
          className="absolute top-1/2 right-1/2 z-10 bg-emerald-500 border-4 border-white p-3 rounded-full transform translate-x-8 -translate-y-8"
          onPress={handleSwapLanguages}
        >
          <MaterialIcons name="swap-vert" size={32} color="white" />
        </TouchableOpacity>
        {/* Target language section */}
        <View className="flex-1 items-end justify-start bg-white p-3 rounded-xl">
          <DropDownPicker
            open={openTarget}
            value={targetLanguage}
            items={DIALECTS}
            setOpen={setOpenTarget}
            setValue={setTargetLanguage}
            placeholder="Select target language"
            style={{
              width: 150,
              backgroundColor: "#10b981",
              borderWidth: 2,
              alignSelf: "flex-end",
              borderColor: "#10b981",
            }}
            dropDownContainerStyle={{
              backgroundColor: "#ffffff",
              width: 150,
              alignSelf: "flex-end",
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
            zIndex={2000}
            zIndexInverse={2000}
            onClose={() => setOpenTarget(false)}
            disableBorderRadius={false}
            maxHeight={200}
          />

          <View className="flex-1 w-full mt-2 justify-center p-2">
            {isTranslating ? (
              <ActivityIndicator size="large" color="#10B981" />
            ) : error ? (
              <Text className="text-red-500 font-psemibold">
                {typeof error === "string"
                  ? error
                  : error || "An unknown error occurred"}
              </Text>
            ) : (
              <TextInput
                placeholder="Translation will appear here..."
                value={translatedText}
                editable={false}
                multiline
                textAlignVertical="top"
                className="flex-1 text-emerald-500 font-pregular text-lg w-full"
              />
            )}
          </View>

          <View className="flex-row w-full gap-4 items-center">
            <TouchableOpacity
              onPress={() => {
                if (translatedText) {
                  copyToClipboard(translatedText);
                }
              }}
              disabled={!translatedText}
            >
              <FontAwesome5
                name="copy"
                size={28}
                color={translatedText ? "#10B981" : "#ccc"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!translatedText || isSpeaking}
              onPress={handleTranslatedSpeech}
            >
              <FontAwesome5
                name="volume-up"
                size={25}
                color={translatedText && !isSpeaking ? "#10B981" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
export default Translate;
