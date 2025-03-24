import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-feather";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { HistoryItemType } from "@/types/types";
import TranslationText from "./TranslationText";
interface HistoryItemProps {
  item: HistoryItemType;
  onDeletePress: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onDeletePress }) => {
  return (
    <View style={styles.historyContainer}>
      {/* Date and Delete button */}
      <View style={styles.headerContainer}>
        <View style={styles.dateContainer}>
          <Calendar
            width={15}
            height={15}
            color={BASE_COLORS.white}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => onDeletePress(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={BASE_COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Language Header */}
        <View style={styles.languageHeaderContainer}>
          <View style={styles.languageHeaderContent}>
            <View style={styles.languageBlock}>
              <Text style={styles.languageLabel}>From</Text>
              <Text style={styles.languageText}>{item.fromLanguage}</Text>
            </View>

            <LinearGradient
              colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.exchangeIconContainer}
            >
              <Feather
                name="repeat"
                size={16}
                color={TITLE_COLORS.customWhite}
              />
            </LinearGradient>

            <View style={styles.languageBlock}>
              <Text style={styles.languageLabel}>To</Text>
              <Text style={styles.languageText}>{item.toLanguage}</Text>
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.translationContainer}>
          <TranslationText
            label="Original"
            text={item.originalText}
            isOriginal
          />
          <TranslationText
            label="Translation"
            text={item.translatedText}
            isOriginal={false}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  historyContainer: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateContainer: {
    borderRadius: 8,
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
  },
  dateIcon: {
    marginRight: 6,
  },
  dateText: {
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    fontSize: 13,
  },
  deleteIcon: {
    padding: 4,
    backgroundColor: BASE_COLORS.orange,
    borderRadius: 8,
  },
  contentContainer: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 13,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  languageHeaderContainer: {
    overflow: "hidden",
  },
  languageHeaderContent: {
    flexDirection: "row",
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  languageBlock: {
    alignItems: "center",
    flex: 1,
  },
  languageLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: TITLE_COLORS.customWhite,
  },
  languageText: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: TITLE_COLORS.customWhite,
  },
  exchangeIconContainer: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: BASE_COLORS.lightBlue,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  translationContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
  },
});

export default HistoryItem;
