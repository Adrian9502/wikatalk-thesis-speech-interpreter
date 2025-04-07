import React from "react";
import {
  View,
  ScrollView,
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

  // If there's an error and no text, show the error message
  const displayValue = translationError
    ? "Translation failed. Please try again."
    : textField;

  return (
    <View style={styles.textAreaWrapper}>
      <ScrollView
        style={[styles.textArea, { borderColor: COLORS.border }]}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {translationError ? (
          // Show error message in red text when there's an error
          <Text style={[styles.textField, styles.errorText]}>
            Translation failed. Please try again.
          </Text>
        ) : (
          // Show normal text input when there's no error
          <TextInput
            value={textField}
            multiline={true}
            editable={!translationError}
            style={[styles.textField, { color: COLORS.text }]}
            placeholder={INITIAL_TEXT}
            placeholderTextColor={COLORS.placeholder}
            onChangeText={handleTextChange}
            onFocus={() => onTextAreaFocus && onTextAreaFocus(position)}
          />
        )}
      </ScrollView>

      {/* Show loading indicator when translating */}
      {isTranslating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}

      {/* Show speaking indicator */}
      {isSpeaking && (
        <View
          style={[styles.speakingContainer, { right: isTranslating ? 46 : 12 }]}
        >
          <Ionicons
            name="volume-high"
            size={18}
            color={COLORS.success || "#10B981"}
          />
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
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 120,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    borderRadius: 12,
    padding: 4,
  },
  speakingContainer: {
    position: "absolute",
    top: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 4,
  },
});

export default TextAreaSection;
