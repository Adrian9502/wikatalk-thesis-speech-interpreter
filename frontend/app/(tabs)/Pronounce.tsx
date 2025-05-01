import React, { useState, useEffect, SetStateAction } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { DIALECTS } from "@/constant/languages";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { BASE_COLORS } from "@/constant/colors";

// Add these interfaces near the top of your file
interface PronunciationItem {
  meaning: string;
  translation: string;
  pronunciation: string;
}

interface PronunciationData {
  [key: string]: PronunciationItem[];
}

// Updated pronunciation data with meaning and pronunciation guide
const MOCK_PRONUNCIATION_DATA: PronunciationData = {
  Cebuano: [
    {
      meaning: "Hello",
      translation: "Kumusta",
      pronunciation: "koo-MOOS-tah",
    },
    {
      meaning: "Thank you",
      translation: "Salamat",
      pronunciation: "sah-LAH-mat",
    },
    {
      meaning: "Yes",
      translation: "Oo",
      pronunciation: "oh-OH",
    },
    {
      meaning: "No",
      translation: "Dili",
      pronunciation: "DEE-lee",
    },
    {
      meaning: "Good morning",
      translation: "Maayong buntag",
      pronunciation: "mah-AH-yong BOON-tag",
    },
    {
      meaning: "Good afternoon",
      translation: "Maayong hapon",
      pronunciation: "mah-AH-yong hah-PON",
    },
    {
      meaning: "Good evening",
      translation: "Maayong gabii",
      pronunciation: "mah-AH-yong gah-BEE",
    },
    {
      meaning: "Where are you?",
      translation: "Asa ka?",
      pronunciation: "AH-sah kah",
    },
    {
      meaning: "What is your name?",
      translation: "Unsa imong ngalan?",
      pronunciation: "OON-sah ee-MONG nga-LAN",
    },
    {
      meaning: "I love you",
      translation: "Gihigugma tika",
      pronunciation: "gee-hee-GOOG-mah TEE-kah",
    },
  ],
  Hiligaynon: [
    {
      meaning: "Hello",
      translation: "Kamusta",
      pronunciation: "kah-MOOS-tah",
    },
    {
      meaning: "Thank you",
      translation: "Salamat",
      pronunciation: "sah-LAH-mat",
    },
    // Add more with proper pronunciation guides
  ],
  // Continue for other languages
};

const Pronounce = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // State for the selected language
  const [selectedLanguage, setSelectedLanguage] = useState("Cebuano");
  const [isDropdownFocus, setIsDropdownFocus] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Using expo-speech to pronounce the phrases
  const handlePlayAudio = (index: any, text: string) => {
    setIsLoading(true);
    setCurrentPlayingIndex(index);

    Speech.speak(text, {
      language: "fil",
      rate: 0.45,
      onStart: () => {
        setIsLoading(false);
      },
      onDone: () => {
        setCurrentPlayingIndex(null);
      },
      onError: () => {
        setIsLoading(false);
        setCurrentPlayingIndex(null);
      },
    });
  };

  // Stop any ongoing speech when component unmounts or language changes
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, [selectedLanguage]);

  // Get the pronunciation data for the selected language
  const pronunciationData: PronunciationItem[] =
    MOCK_PRONUNCIATION_DATA[selectedLanguage] || [];

  return (
    <SafeAreaView style={[dynamicStyles.container, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pronunciation Guide</Text>
        <Text style={styles.headerSubtitle}>
          Learn how to pronounce common phrases
        </Text>
      </View>

      {/* Language Selection Dropdown */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Language:</Text>
        <Dropdown
          style={[
            styles.dropdown,
            {
              borderColor: BASE_COLORS.borderColor,
              backgroundColor: BASE_COLORS.lightBlue,
            },
            isDropdownFocus && { borderColor: BASE_COLORS.blue },
          ]}
          placeholderStyle={[
            styles.dropdownText,
            { color: BASE_COLORS.placeholderText },
          ]}
          selectedTextStyle={[
            styles.dropdownText,
            { color: BASE_COLORS.blue, borderRadius: 8 },
          ]}
          data={DIALECTS}
          maxHeight={250}
          labelField="label"
          valueField="value"
          placeholder="Select language"
          value={selectedLanguage}
          onFocus={() => setIsDropdownFocus(true)}
          onBlur={() => setIsDropdownFocus(false)}
          onChange={(item) => {
            setSelectedLanguage(item.value);
            setIsDropdownFocus(false);
            setCurrentPlayingIndex(null);
            // Stop any ongoing speech
            Speech.stop();
          }}
          renderRightIcon={() => (
            <Ionicons
              name={isDropdownFocus ? "chevron-up" : "chevron-down"}
              size={18}
              color={BASE_COLORS.blue}
            />
          )}
          activeColor={BASE_COLORS.lightBlue}
          containerStyle={styles.dropdownList}
        />
      </View>

      {/* Pronunciation Table */}
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Meaning</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>
            {selectedLanguage}
          </Text>
          <Text style={[styles.tableHeaderText, { flex: 3 }]}>
            Pronunciation
          </Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Audio</Text>
        </View>

        {/* Table Body */}
        <ScrollView style={styles.tableBody}>
          {pronunciationData.map((item: PronunciationItem, index: number) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
              ]}
            >
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {item.meaning}
              </Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {item.translation}
              </Text>
              <Text
                style={[styles.tableCell, { flex: 3, fontStyle: "italic" }]}
              >
                {item.pronunciation}
              </Text>
              <View style={[styles.tableCell]}>
                <TouchableOpacity
                  onPress={() => handlePlayAudio(index, item.translation)}
                  disabled={isLoading}
                  style={styles.audioButton}
                >
                  {isLoading && currentPlayingIndex === index ? (
                    <ActivityIndicator size="small" color={BASE_COLORS.blue} />
                  ) : (
                    <Ionicons
                      name={
                        currentPlayingIndex === index
                          ? "volume-high"
                          : "volume-medium-outline"
                      }
                      size={22}
                      color={
                        currentPlayingIndex === index
                          ? BASE_COLORS.success
                          : BASE_COLORS.blue
                      }
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 23,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    marginBottom: 8,
  },
  dropdown: {
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    paddingHorizontal: 12,
  },
  dropdownList: {
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderColor: BASE_COLORS.borderColor,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  tableContainer: {
    flex: 1,
    backgroundColor: BASE_COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BASE_COLORS.blue,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    color: BASE_COLORS.white,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BASE_COLORS.borderColor,
  },
  tableRowEven: {
    backgroundColor: BASE_COLORS.white,
  },
  tableRowOdd: {
    backgroundColor: BASE_COLORS.lightGray,
  },
  tableCell: {
    flex: 1,
    alignItems: "center",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.darkText,
  },
  audioButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
});

export default Pronounce;
