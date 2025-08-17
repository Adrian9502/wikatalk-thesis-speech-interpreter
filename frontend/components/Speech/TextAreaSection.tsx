import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Text,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import useLanguageStore from "@/store/useLanguageStore";
import { INITIAL_TEXT } from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";

interface TextAreaSectionProps {
  textField: string;
  colors: any;
  position: "top" | "bottom";
  onTextAreaFocus?: (position: "top" | "bottom") => void;
}

const TextAreaSection: React.FC<TextAreaSectionProps> = ({
  textField,
  colors: COLORS,
  position,
  onTextAreaFocus,
}) => {
  const isScrolling = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    setUpperText,
    setBottomText,
    debouncedTranslate,
    isTranslating,
    isTopSpeaking,
    isBottomSpeaking,
    translationError,
  } = useLanguageStore();

  // Determine if this section is currently speaking
  const isSpeaking = position === "top" ? isTopSpeaking : isBottomSpeaking;

  const handleTextChange = (text: string) => {
    // If there's an error, don't allow editing
    if (translationError) return;

    // If initial text, clear it when user starts typing
    if (textField === INITIAL_TEXT && text !== INITIAL_TEXT) {
      text = text.replace(INITIAL_TEXT, "");
    }

    // Update text in store
    if (position === "top") {
      setUpperText(text);
    } else {
      setBottomText(text);
    }

    // Trigger debounced translation if text is not empty
    if (text && text !== INITIAL_TEXT) {
      debouncedTranslate(text, position);
    }
  };

  const handleFocus = () => {
    // Only trigger focus callback if not currently scrolling
    if (!isScrolling.current && onTextAreaFocus) {
      onTextAreaFocus(position);
    }
  };

  const handleScroll = () => {
    // Set scrolling state to true
    isScrolling.current = true;

    // Clear any existing timer
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }

    // Set timer to reset scrolling state after scroll ends
    scrollTimer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 150); // 150ms delay after scrolling stops
  };

  // If there's an error and no text, show the error message
  const displayValue = translationError
    ? "Translation failed. Please try again."
    : textField;

  return (
    <View style={styles.textAreaWrapper}>
      {translationError ? (
        // Show error message in a non-editable text area when there's an error
        <View style={[styles.textArea, { borderColor: COLORS.border }]}>
          <Text style={[styles.textField, styles.errorText]}>
            {displayValue}
          </Text>
        </View>
      ) : (
        // Show scrollable text input when there's no error
        <TextInput
          value={displayValue}
          onChangeText={handleTextChange}
          multiline
          style={[
            styles.textArea,
            styles.textField,
            {
              borderColor: COLORS.border,
              color: COLORS.text,
            },
          ]}
          placeholder={INITIAL_TEXT}
          placeholderTextColor={COLORS.placeholder}
          editable={true} // Always true for scrolling to work
          scrollEnabled={true}
          textAlignVertical="top"
          onFocus={handleFocus}
          onScroll={handleScroll}
          showSoftInputOnFocus={true} // Show keyboard since all are editable
        />
      )}

      {/* Show loading indicator when translating */}
      {isTranslating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  textAreaWrapper: {
    flex: 1,
    marginVertical: 8,
    position: "relative",
    minHeight: 100,
  },
  textArea: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    minHeight: 120,
    flex: 1,
  },
  textField: {
    fontFamily: "Poppins-Regular",
    fontSize: 17,
    lineHeight: 24,
    textAlignVertical: "top",
    minHeight: 80,
  },
  errorText: {
    color: BASE_COLORS.orange,
  },
  loadingContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    padding: 4,
  },
});

export default TextAreaSection;
