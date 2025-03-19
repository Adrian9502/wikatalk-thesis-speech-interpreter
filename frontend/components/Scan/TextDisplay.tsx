import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import DotsLoader from "@/components/DotLoader";

interface TextDisplayProps {
  title: string;
  text: string;
  placeholder: string;
  isLoading: boolean;
  isSpeaking: boolean; // This will be isSourceSpeaking or isTargetSpeaking
  copied: boolean;
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
  onSpeak,
  onClear,
  editable = false,
  color = BASE_COLORS.blue,
}) => {
  return (
    <View style={styles.textSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onSpeak}
            disabled={!text || isLoading}
          >
            <Ionicons
              name={isSpeaking ? "volume-high" : "volume-medium-outline"}
              size={22}
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
              size={22}
              color={copied ? BASE_COLORS.success : color}
            />
          </TouchableOpacity>

          {editable && onClear && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onClear}
              disabled={!text || isLoading}
            >
              <Ionicons name="trash-outline" size={22} color={color} />
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
          <ScrollView
            style={styles.textArea}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {editable ? (
              <TextInput
                value={text}
                onChangeText={onChangeText}
                multiline
                style={styles.textField}
                placeholder={placeholder}
                placeholderTextColor={BASE_COLORS.placeholderText}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.translatedText}>{text || placeholder}</Text>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textSection: {
    flex: 1,
    marginVertical: 6,
    minHeight: 120, // Add minimum height
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
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
    borderRadius: 8,
    marginLeft: 4,
  },
  textAreaWrapper: {
    flex: 1,
    minHeight: 100, // Add minimum height
  },
  textArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
    minHeight: 100, // Add minimum height
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: 80, // Add minimum height to content
  },
  textField: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#333",
    flex: 1,
    textAlignVertical: "top",
    minHeight: 80, // Add minimum height
  },
  translatedText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    minHeight: 100, // Add minimum height
  },
});

export default TextDisplay;
