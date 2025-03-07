import React from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DropDownPicker from "react-native-dropdown-picker";
import ControlButtons from "./ControlButtons";
import { DIALECTS } from "@/constant/languages";
import { Audio } from "expo-av";

interface LanguageSectionProps {
  position: "top" | "bottom";
  language: string;
  textField: string;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  closeOtherDropdown: () => void;
  getLanguageBackground: (language: string) => string | ImageSourcePropType;
  showInfo: (language: string, section: "top" | "bottom") => void;
  copyToClipboard: (text: string) => Promise<void>;
  clearText: (section: "top" | "bottom") => void;
  handlePress: (userNum: number) => Promise<void>;
  recording: Audio.Recording | undefined;
  user: any;
  userId: string | number;
  controlsPosition?: "top" | "bottom";
}

const LanguageSection: React.FC<LanguageSectionProps> = ({
  position,
  language,
  setLanguage,
  textField,
  dropdownOpen,
  setDropdownOpen,
  closeOtherDropdown,
  getLanguageBackground,
  showInfo,
  copyToClipboard,
  clearText,
  handlePress,
  recording,
  user,
  userId,
  controlsPosition = "bottom", // 'top' or 'bottom'
}) => {
  // Configuration based on position (top or bottom)
  const config: Record<
    string,
    {
      gradientColors: [string, string];
      backgroundColor: string;
      imageRotate: boolean;
      contentRotate: boolean;
    }
  > = {
    top: {
      gradientColors: ["rgba(206, 17, 38, 0.8)", "rgba(206, 17, 38, 0.6)"],
      backgroundColor: "#CE1126",
      imageRotate: true,
      contentRotate: true, // Always rotate content for top section
    },
    bottom: {
      gradientColors: ["rgba(0, 56, 168, 0.8)", "rgba(0, 56, 168, 0.6)"],
      backgroundColor: "#0038A8",
      imageRotate: false,
      contentRotate: false,
    },
  };

  const positionConfig = config[position];

  // Function to render controls (dropdown and buttons)
  const renderControls = () => (
    <View
      className={`flex-row items-center justify-between w-full ${
        positionConfig.contentRotate ? "rotate-180" : ""
      }`}
    >
      {/* Language Dropdown */}
      <View className="flex-1 mr-4">
        <DropDownPicker
          open={dropdownOpen}
          value={language}
          items={DIALECTS}
          setOpen={setDropdownOpen}
          setValue={setLanguage}
          placeholder="Select language"
          onOpen={closeOtherDropdown}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
          style={{
            backgroundColor: positionConfig.backgroundColor,
            borderWidth: 1,
            borderColor: "#FFD700",
            borderRadius: 10,
          }}
          dropDownContainerStyle={{
            backgroundColor: positionConfig.backgroundColor,
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

      {/* Info, Copy, Delete and Mic */}
      <ControlButtons
        showInfoHandler={showInfo}
        copyHandler={copyToClipboard}
        clearTextHandler={clearText}
        micPressHandler={handlePress}
        languageValue={language}
        textValue={textField}
        position={position}
        isRecording={recording}
        activeUser={user}
        userId={userId}
      />
    </View>
  );

  // Function to render text area
  const renderTextArea = () => {
    const marginStyle =
      controlsPosition === "top" ? { marginTop: 36 } : { marginBottom: 36 };
    return (
      <ScrollView
        style={{
          flex: 1,
          width: "100%",
          borderRadius: 8,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: 12,
          ...marginStyle,
          ...(position === "top" ? { transform: [{ rotate: "180deg" }] } : {}),
        }}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{
          flexGrow: 1,
          ...(position === "top" ? { minHeight: "100%" } : {}),
        }}
      >
        <View className="flex-1">
          <Text
            numberOfLines={0}
            className="text-yellow-400 font-medium text-xl"
          >
            {textField}
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <View
      style={{ width: "100%", height: "45%", paddingTop: 5, paddingBottom: 5 }}
    >
      <ImageBackground
        source={
          typeof getLanguageBackground(language) === "string"
            ? { uri: getLanguageBackground(language) as string } // Convert string to `{ uri }`
            : (getLanguageBackground(language) as ImageSourcePropType) // Use local image directly
        }
        className="w-full h-full rounded-2xl overflow-hidden"
        resizeMode="cover"
        imageStyle={
          positionConfig.imageRotate
            ? { transform: [{ rotate: "180deg" }] }
            : {}
        }
      >
        <LinearGradient
          colors={positionConfig.gradientColors}
          className="w-full h-full"
        >
          <View className="w-full flex-1 rounded-2xl p-4 relative">
            {/* Render controls first if controlsPosition is 'top' */}
            {controlsPosition === "top" && renderControls()}

            {/* Text area */}
            {renderTextArea()}

            {/* Render controls last if controlsPosition is 'bottom' */}
            {controlsPosition === "bottom" && renderControls()}
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default LanguageSection;
