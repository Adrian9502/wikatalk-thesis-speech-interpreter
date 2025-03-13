import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ImageSourcePropType,
  TextInput,
  Image,
  Animated,
  Text,
  TouchableOpacity,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constant/languages";
import { LanguageSectionProps } from "@/types/types";

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
  userId,
}) => {
  // Animation for microphone button
  const [micAnimation] = useState(new Animated.Value(1));
  const [copySuccess, setCopySuccess] = useState(false);

  // Colors based on position
  const COLORS = {
    primary: position === "top" ? "#4A6FFF" : "#FF6F4A",
    secondary: position === "top" ? "#E2EAFF" : "#F3E2FF",
    background: "#FFFFFF",
    text: "#212132",
    placeholder: "#9E9EA7",
    border: "#E8E8ED",
    success: "#10B981",
  };

  // Animation for recording
  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(micAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(micAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [recording]);

  // Handle copy with animation
  const handleCopy = async () => {
    await copyToClipboard(textField);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={dropdownOpen}
            value={language}
            items={DIALECTS}
            setOpen={setDropdownOpen}
            setValue={setLanguage}
            onOpen={closeOtherDropdown}
            listMode="SCROLLVIEW"
            scrollViewProps={{ nestedScrollEnabled: true }}
            style={[styles.dropdown, { borderColor: COLORS.border }]}
            dropDownContainerStyle={[
              styles.dropdownList,
              { borderColor: COLORS.border },
            ]}
            textStyle={[styles.dropdownText, { color: COLORS.text }]}
            placeholderStyle={{ color: COLORS.placeholder }}
            placeholder="Select language"
            maxHeight={240}
            ArrowDownIconComponent={() => (
              <Ionicons name="chevron-down" size={18} color={COLORS.primary} />
            )}
            ArrowUpIconComponent={() => (
              <Ionicons name="chevron-up" size={18} color={COLORS.primary} />
            )}
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => showInfo(language, position)}
          >
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleCopy}
            disabled={!textField}
          >
            <Ionicons
              name={copySuccess ? "checkmark-circle" : "copy-outline"}
              size={22}
              color={copySuccess ? COLORS.success : COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => clearText(position)}
            disabled={!textField}
          >
            <Ionicons name="trash-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Text Area */}
      <View style={styles.textAreaWrapper}>
        <ScrollView
          style={[styles.textArea, { borderColor: COLORS.border }]}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TextInput
            value={textField}
            multiline={true}
            editable={false}
            style={[styles.textField, { color: COLORS.text }]}
            placeholder={
              "Tap the microphone icon to begin recording. Tap again to stop."
            }
            placeholderTextColor={COLORS.placeholder}
          />
        </ScrollView>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePress(userId as number)}
          style={[styles.micButton, { backgroundColor: COLORS.primary }]}
        >
          <Animated.View style={{ transform: [{ scale: micAnimation }] }}>
            <MaterialCommunityIcons
              name={recording ? "microphone" : "microphone-outline"}
              size={28}
              color="#FFFFFF"
            />
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          <Image
            source={
              typeof getLanguageBackground(language) === "string"
                ? { uri: getLanguageBackground(language) as string }
                : (getLanguageBackground(language) as ImageSourcePropType)
            }
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.12)", "rgba(0,0,0,0)"]}
            style={styles.imageOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.languageLabel}>
            <Text style={styles.languageName}>{language}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "45%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    position: "relative",
    padding: 20,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdownContainer: {
    zIndex: 1000,
    flex: 1,
    maxWidth: 160,
  },
  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    backgroundColor: "#FFFFFF",
  },
  dropdownList: {
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginLeft: 8,
  },
  textAreaWrapper: {
    flex: 1,
    marginVertical: 8,
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  textField: {
    fontSize: 17,
    fontWeight: "400",
    lineHeight: 24,
    textAlignVertical: "top",
  },
  bottomSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    height: 90,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    flex: 1,
    height: 90,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  languageLabel: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  languageName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default LanguageSection;
