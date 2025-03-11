import React from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
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
}) => {
  // Configuration based on position (top or bottom)
  const config: Record<
    string,
    {
      gradientColors: [string, string];
      backgroundColor: string;
      imageRotate: boolean;
    }
  > = {
    top: {
      gradientColors: ["rgba(206, 17, 38, 0.8)", "rgba(206, 17, 38, 0.6)"],
      backgroundColor: "#CE1126",
      imageRotate: true,
    },
    bottom: {
      gradientColors: ["rgba(0, 56, 168, 0.8)", "rgba(0, 56, 168, 0.6)"],
      backgroundColor: "#0038A8",
      imageRotate: false,
    },
  };

  const positionConfig = config[position];

  // Function to render controls (dropdown and buttons)
  const renderControls = () => (
    <View style={[styles.controlsContainer]}>
      {/* Language Dropdown */}
      <View style={styles.dropdownWrapper}>
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
    return (
      <ScrollView
        style={{
          flex: 1,
          width: "100%",
          borderRadius: 8,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: 12,
          marginTop: 36,
        }}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.textAreaContent}>
          <Text numberOfLines={0} style={styles.textFieldStyle}>
            {textField}
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.languageSectionContainer}>
      <ImageBackground
        source={
          typeof getLanguageBackground(language) === "string"
            ? { uri: getLanguageBackground(language) as string } // Convert string to `{ uri }`
            : (getLanguageBackground(language) as ImageSourcePropType) // Use local image directly
        }
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={positionConfig.gradientColors}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            {/* Render controls first if controlsPosition is 'top' */}
            {renderControls()}
            {/* Text area */}
            {renderTextArea()}
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default LanguageSection;

const styles = StyleSheet.create({
  languageSectionContainer: {
    width: "100%",
    height: "45%",
    paddingTop: 5,
    paddingBottom: 5,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    width: "100%",
    flex: 1,
    borderRadius: 16,
    padding: 16,
    position: "relative",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  dropdownWrapper: {
    flex: 1,
    marginRight: 16,
  },
  textAreaContent: {
    flex: 1,
  },
  textFieldStyle: {
    color: "#FACC15",
    fontWeight: "500",
    fontSize: 20,
  },
});
