import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import DotsLoader from "../DotLoader";
import ConfidenceModal from "@/components/ConfidenceModal";

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

  return (
    <View style={styles.textSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isSpeaking && styles.controlButtonActive,
            ]}
            onPress={onSpeak}
            disabled={!text || isLoading}
          >
            <Ionicons
              name={isSpeaking ? "volume-high" : "volume-medium-outline"}
              size={18}
              color={isSpeaking ? BASE_COLORS.success : color}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={onCopy}
            disabled={!text || isLoading}
          >
            <Ionicons
              name={copied ? "checkmark-circle" : "copy-outline"}
              size={18}
              color={copied ? BASE_COLORS.success : color}
            />
          </TouchableOpacity>

          {language && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleShowConfidence}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={BASE_COLORS.orange}
              />
            </TouchableOpacity>
          )}

          {editable && onClear && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onClear}
              disabled={!text || isLoading}
            >
              <Ionicons name="trash-outline" size={18} color={color} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.textAreaWrapper}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <DotsLoader />
          </View>
        ) : (
          <TextInput
            value={text || (editable ? "" : placeholder)}
            onChangeText={handleChangeText}
            multiline
            style={[
              styles.textArea,
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
    marginVertical: 6,
    minHeight: 140,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 40,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginLeft: 4,
  },
  textAreaWrapper: {
    flex: 1,
    minHeight: 120,
    maxHeight: 200,
  },
  textArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    minHeight: 120,
    maxHeight: 200,
    padding: 12,
  },
  textField: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.darkText,
    textAlignVertical: "top",
  },
  translatedText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
    lineHeight: 20,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    minHeight: 120,
  },
  controlButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
});

export default TextDisplay;
