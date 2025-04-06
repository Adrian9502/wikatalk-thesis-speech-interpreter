import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";

interface TextDisplayProps {
  title: string;
  text: string;
  placeholder: string;
  isLoading: boolean;
  isSpeaking: boolean;
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
            <ActivityIndicator size="large" color={color} />
          </View>
        ) : editable ? (
          <ScrollView
            style={styles.textArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <TextInput
              value={text}
              onChangeText={onChangeText}
              multiline
              style={styles.textField}
              placeholder={placeholder}
              placeholderTextColor={BASE_COLORS.placeholderText}
              editable={editable}
            />
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.textArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {text ? (
              <TextInput
                value={text}
                onChangeText={onChangeText}
                multiline
                style={styles.textField}
                placeholder={placeholder}
                placeholderTextColor={BASE_COLORS.placeholderText}
                editable={false}
              />
            ) : (
              <TextInput
                value={text}
                onChangeText={onChangeText}
                multiline
                style={styles.textField}
                placeholder={placeholder}
                placeholderTextColor={BASE_COLORS.placeholderText}
                editable={false}
              />
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
    minHeight: 120,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
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
    minHeight: 100,
  },
  textArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    minHeight: 100,
    maxHeight: 200,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: 80,
    padding: 10,
  },
  textField: {
    fontFamily: "Poppins-Regular",
    fontSize: 17,
    lineHeight: 24,
    color: BASE_COLORS.darkText,
    textAlignVertical: "top",
    minHeight: 80,
  },
  translatedText: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  placeholderText: {
    fontSize: 17,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    minHeight: 100,
  },
});

export default TextDisplay;
