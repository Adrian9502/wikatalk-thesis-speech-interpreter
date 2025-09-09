import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import DotsLoader from "../DotLoader";
import ConfidenceModal from "@/components/ConfidenceModal";
import {
  FONT_SIZES,
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
} from "@/constant/fontSizes";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check if it's a small screen (like Nexus 4)
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280;
const isMediumScreen = screenWidth <= 414 && screenHeight <= 896;

interface TextDisplayProps {
  title: string;
  text: string;
  placeholder: string;
  isLoading: boolean;
  isSpeaking: boolean;
  copied: boolean;
  language?: string;
  onChangeText?: (text: string) => void;
  onCopy: () => void;
  onSpeak: () => void;
  onClear?: () => void;
  editable?: boolean;
  color?: string;
}

const TextDisplay: React.FC<TextDisplayProps> = ({
  title,
  text,
  placeholder,
  isLoading,
  isSpeaking,
  copied,
  onChangeText,
  onCopy,
  language,
  onSpeak,
  onClear,
  editable = false,
  color = BASE_COLORS.blue,
}) => {
  const [confidenceModalVisible, setConfidenceModalVisible] = useState(false);
  const handleShowConfidence = () => {
    setConfidenceModalVisible(true);
  };

  // Store the original value for non-editable fields
  const originalValue = useRef(text);

  // Update the ref when text changes
  React.useEffect(() => {
    if (!editable) {
      originalValue.current = text;
    }
  }, [text, editable]);

  // Handler to prevent editing for non-editable fields
  const handleChangeText = (newText: string) => {
    if (editable && onChangeText) {
      onChangeText(newText);
    }
    // For non-editable, do nothing - text won't change
  };

  // Prevent keyboard from showing for non-editable fields
  const handleFocus = (e: any) => {
    if (!editable) {
      e.target.blur();
    }
  };

  // Get responsive dimensions
  const getResponsiveDimensions = () => {
    return {
      minHeight: isSmallScreen ? 80 : isMediumScreen ? 100 : 120,
      maxHeight: isSmallScreen ? 140 : isMediumScreen ? 160 : 200,
      padding: isSmallScreen ? 10 : 12,
      marginVertical: isSmallScreen ? 4 : 6,
      borderRadius: isSmallScreen ? 16 : 20,
      controlButtonSize: isSmallScreen ? 32 : 40,
      controlButtonHeight: isSmallScreen ? 25 : 30,
      iconSize: isSmallScreen ? 15 : 17,
    };
  };

  const dimensions = getResponsiveDimensions();

  return (
    <View
      style={[
        styles.textSection,
        { marginVertical: dimensions.marginVertical },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                width: dimensions.controlButtonSize,
                height: dimensions.controlButtonHeight,
              },
              isSpeaking && styles.controlButtonActive,
            ]}
            onPress={onSpeak}
            disabled={!text || isLoading}
          >
            <Ionicons
              name={isSpeaking ? "volume-high" : "volume-medium-outline"}
              size={dimensions.iconSize}
              color={isSpeaking ? BASE_COLORS.success : color}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                width: dimensions.controlButtonSize,
                height: dimensions.controlButtonHeight,
              },
            ]}
            onPress={onCopy}
            disabled={!text || isLoading}
          >
            <Ionicons
              name={copied ? "checkmark-circle" : "copy-outline"}
              size={dimensions.iconSize}
              color={copied ? BASE_COLORS.success : color}
            />
          </TouchableOpacity>

          {language && (
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  width: dimensions.controlButtonSize,
                  height: dimensions.controlButtonHeight,
                },
              ]}
              onPress={handleShowConfidence}
            >
              <Ionicons
                name="information-circle-outline"
                size={isSmallScreen ? 18 : 20}
                color={BASE_COLORS.orange}
              />
            </TouchableOpacity>
          )}

          {editable && onClear && (
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  width: dimensions.controlButtonSize,
                  height: dimensions.controlButtonHeight,
                },
              ]}
              onPress={onClear}
              disabled={!text || isLoading}
            >
              <Ionicons
                name="trash-outline"
                size={dimensions.iconSize}
                color={color}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View
        style={[
          styles.textAreaWrapper,
          {
            minHeight: dimensions.minHeight,
            maxHeight: dimensions.maxHeight,
          },
        ]}
      >
        {isLoading ? (
          <View
            style={[
              styles.loaderContainer,
              {
                minHeight: dimensions.minHeight,
                borderRadius: dimensions.borderRadius,
              },
            ]}
          >
            <DotsLoader />
          </View>
        ) : (
          <TextInput
            value={text || (editable ? "" : placeholder)}
            onChangeText={handleChangeText}
            multiline
            style={[
              styles.textArea,
              {
                minHeight: dimensions.minHeight,
                maxHeight: dimensions.maxHeight,
                padding: dimensions.padding,
                borderRadius: dimensions.borderRadius,
              },
              styles.textField,
              !text && !editable
                ? styles.placeholderText
                : styles.translatedText,
            ]}
            placeholder={editable ? placeholder : undefined}
            placeholderTextColor={BASE_COLORS.placeholderText}
            editable={true} // Always true for scrolling to work
            scrollEnabled={true}
            textAlignVertical="top"
            // These props help make it "fake" non-editable
            selectTextOnFocus={false}
            showSoftInputOnFocus={editable} // Only show keyboard for editable
            onFocus={handleFocus}
            caretHidden={!editable} // Hide cursor for non-editable
            contextMenuHidden={!editable} // Hide context menu for non-editable
            selection={!editable ? { start: 0, end: 0 } : undefined} // Prevent selection for non-editable
            // Android specific
            importantForAutofill={editable ? "auto" : "no"}
            keyboardType={
              editable
                ? "default"
                : Platform.OS === "android"
                ? "visible-password"
                : "default"
            }
          />
        )}
      </View>
      <ConfidenceModal
        visible={confidenceModalVisible}
        language={language as string}
        onClose={() => setConfidenceModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  textSection: {
    flex: 1,
    minHeight: isSmallScreen ? 100 : 140,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: isSmallScreen ? 3 : 4,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.translation.language,
    fontFamily: POPPINS_FONT.medium,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginLeft: isSmallScreen ? 3 : 4,
  },
  textAreaWrapper: {
    flex: 1,
  },
  textArea: {
    flex: 1,
    backgroundColor: BASE_COLORS.offWhite,
  },
  textField: {
    fontFamily: POPPINS_FONT.regular,
    fontSize: COMPONENT_FONT_SIZES.translation.sourceText,
    color: BASE_COLORS.darkText,
    textAlignVertical: "top",
  },
  translatedText: {
    fontSize: COMPONENT_FONT_SIZES.translation.translatedText,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    lineHeight: COMPONENT_FONT_SIZES.translation.translatedText * 1.4,
  },
  placeholderText: {
    fontSize: COMPONENT_FONT_SIZES.translation.sourceText,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.offWhite,
  },
  controlButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
});

export default TextDisplay;
