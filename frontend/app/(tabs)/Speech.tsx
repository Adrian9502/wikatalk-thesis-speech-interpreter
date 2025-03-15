import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import React, { useReducer } from "react";
import { StatusBar } from "expo-status-bar";
import { LANGUAGE_INFO } from "@/app/constant/languages";
import getLanguageBackground from "@/app/utils/getLanguageBackground";
import SwapButton from "@/app/components/home/SwapButton";
import { useRecordingTranslation } from "@/app/hooks/useRecordingTranslation";
import { useRecording } from "@/app/hooks/useRecording";
import LanguageSection from "@/app/components/home/LanguageSection";
import LanguageInfoModal from "@/app/components/home/LanguageInfoModal";
import Loading from "@/app/components/home/Loading";
import { BASE_COLORS, TITLE_COLORS } from "@/app/constant/colors";
import WikaTalkLogo from "@/app/components/WikaTalkLogo";

// Constants
const INITIAL_TEXT =
  "Tap the microphone icon to begin recording. Tap again to stop.";

// State and Action Types
type AppState = {
  language1: string;
  language2: string;
  upperTextfield: string;
  bottomTextfield: string;
  activeUser: number;
  showLanguageInfo: boolean;
  activeLanguageInfo: string;
  openTopDropdown: boolean;
  openBottomDropdown: boolean;
};

type AppAction =
  | { type: "SET_LANGUAGE_1"; payload: string }
  | { type: "SET_LANGUAGE_2"; payload: string }
  | { type: "SET_UPPER_TEXT"; payload: string }
  | { type: "SET_BOTTOM_TEXT"; payload: string }
  | { type: "SET_BOTH_TEXTS"; payload: { upper: string; bottom: string } }
  | { type: "SET_ACTIVE_USER"; payload: number }
  | { type: "TOGGLE_LANGUAGE_INFO"; payload: boolean }
  | { type: "SET_ACTIVE_LANGUAGE_INFO"; payload: string }
  | { type: "TOGGLE_TOP_DROPDOWN"; payload: boolean }
  | { type: "TOGGLE_BOTTOM_DROPDOWN"; payload: boolean }
  | { type: "CLEAR_TEXT"; payload: "top" | "bottom" }
  | { type: "SWAP_LANGUAGES" };

// Reducer Function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_LANGUAGE_1":
      return { ...state, language1: action.payload };
    case "SET_LANGUAGE_2":
      return { ...state, language2: action.payload };
    case "SET_UPPER_TEXT":
      return { ...state, upperTextfield: action.payload };
    case "SET_BOTTOM_TEXT":
      return { ...state, bottomTextfield: action.payload };
    case "SET_BOTH_TEXTS":
      return {
        ...state,
        upperTextfield: action.payload.upper,
        bottomTextfield: action.payload.bottom,
      };
    case "SET_ACTIVE_USER":
      return { ...state, activeUser: action.payload };
    case "TOGGLE_LANGUAGE_INFO":
      return { ...state, showLanguageInfo: action.payload };
    case "SET_ACTIVE_LANGUAGE_INFO":
      return { ...state, activeLanguageInfo: action.payload };
    case "TOGGLE_TOP_DROPDOWN":
      return {
        ...state,
        openTopDropdown: action.payload,
        // Close bottom dropdown when top opens
        openBottomDropdown: action.payload ? false : state.openBottomDropdown,
      };
    case "TOGGLE_BOTTOM_DROPDOWN":
      return {
        ...state,
        openBottomDropdown: action.payload,
        // Close top dropdown when bottom opens
        openTopDropdown: action.payload ? false : state.openTopDropdown,
      };
    case "CLEAR_TEXT":
      return action.payload === "top"
        ? { ...state, upperTextfield: "" }
        : { ...state, bottomTextfield: "" };
    case "SWAP_LANGUAGES":
      return {
        ...state,
        language1: state.language2,
        language2: state.language1,
      };
    default:
      return state;
  }
};

const Speech = () => {
  // Initial state
  const initialState: AppState = {
    language1: "Tagalog",
    language2: "Cebuano",
    upperTextfield: INITIAL_TEXT,
    bottomTextfield: INITIAL_TEXT,
    activeUser: 1,
    showLanguageInfo: false,
    activeLanguageInfo: "",
    openTopDropdown: false,
    openBottomDropdown: false,
  };

  // Custom hooks
  const { recording, startRecording, stopRecording } = useRecording();
  const { loading, translateAudio, speakText } = useRecordingTranslation();

  // Reducer
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Handle text field updates based on user
  const handleTextfield = (translatedText: string, transcribedText: string) => {
    if (state.activeUser === 1) {
      dispatch({
        type: "SET_BOTH_TEXTS",
        payload: { upper: translatedText, bottom: transcribedText },
      });
    } else {
      dispatch({
        type: "SET_BOTH_TEXTS",
        payload: { upper: transcribedText, bottom: translatedText },
      });
    }
  };

  // Handle microphone press
  const handlePress = async (userNum: number) => {
    dispatch({ type: "SET_ACTIVE_USER", payload: userNum });

    if (recording) {
      const uri = await stopRecording();
      if (uri) {
        const sourceLang = userNum === 1 ? state.language1 : state.language2;
        const targetLang = userNum === 1 ? state.language2 : state.language1;

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

  // Handle show info of dialect on image and info icon press
  const showInfo = (language: string) => {
    dispatch({ type: "SET_ACTIVE_LANGUAGE_INFO", payload: language });
    dispatch({ type: "TOGGLE_LANGUAGE_INFO", payload: true });
  };
  // Handle copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };
  // Handle clear text on delete icon press
  const clearText = (section: "top" | "bottom") => {
    dispatch({ type: "CLEAR_TEXT", payload: section });
  };
  // Handle swap language base on switch button press
  const handleSwapLanguage = () => {
    dispatch({ type: "SWAP_LANGUAGES" });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView
        style={styles.safeAreaView}
        edges={["top", "left", "right"]}
      >
        {/* WikaSpeak */}
        <WikaTalkLogo title={"Speak"} />
        {/* Top section  */}
        <LanguageSection
          position="top"
          language={state.language2}
          setLanguage={(lang) =>
            dispatch({ type: "SET_LANGUAGE_2", payload: lang })
          }
          textField={state.upperTextfield}
          dropdownOpen={state.openTopDropdown}
          setDropdownOpen={(isOpen) =>
            dispatch({ type: "TOGGLE_TOP_DROPDOWN", payload: isOpen })
          }
          closeOtherDropdown={() =>
            dispatch({ type: "TOGGLE_BOTTOM_DROPDOWN", payload: false })
          }
          getLanguageBackground={getLanguageBackground}
          showInfo={showInfo}
          copyToClipboard={copyToClipboard}
          clearText={clearText}
          handlePress={handlePress}
          recording={recording ?? undefined}
          userId={2}
        />
        {/* Middle Section - Exchange icon  */}
        <View style={styles.middleSection}>
          {/* Switch icon */}
          <SwapButton
            onPress={handleSwapLanguage}
            colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
            borderStyle={styles.swapButtonBorder}
            iconColor={BASE_COLORS.white}
          />
        </View>

        {/* Bottom section */}
        <LanguageSection
          position="bottom"
          language={state.language1}
          setLanguage={(lang) =>
            dispatch({ type: "SET_LANGUAGE_1", payload: lang })
          }
          textField={state.bottomTextfield}
          dropdownOpen={state.openBottomDropdown}
          setDropdownOpen={(isOpen) =>
            dispatch({ type: "TOGGLE_BOTTOM_DROPDOWN", payload: isOpen })
          }
          closeOtherDropdown={() =>
            dispatch({ type: "TOGGLE_TOP_DROPDOWN", payload: false })
          }
          getLanguageBackground={getLanguageBackground}
          showInfo={showInfo}
          copyToClipboard={copyToClipboard}
          clearText={clearText}
          handlePress={handlePress}
          recording={recording ?? undefined}
          userId={1}
        />

        {/* Language Information Modal */}
        {state.showLanguageInfo &&
          state.activeLanguageInfo &&
          LANGUAGE_INFO[state.activeLanguageInfo] && (
            <LanguageInfoModal
              visible={state.showLanguageInfo}
              languageName={state.activeLanguageInfo}
              onClose={() => {
                dispatch({ type: "TOGGLE_LANGUAGE_INFO", payload: false });
              }}
            />
          )}

        {/* Loading Indicator */}
        {loading && <Loading />}
      </SafeAreaView>
    </View>
  );
};

export default Speech;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TITLE_COLORS.customNavyBlue,
  },
  safeAreaView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  middleSection: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 8,
    zIndex: 10,
  },
  swapButtonBorder: {
    borderWidth: 1,
  },
});
