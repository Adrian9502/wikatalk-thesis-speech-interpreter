import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Calendar, Zap, AlignCenter, Edit3 } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";

const Games = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  const handleWordOfDayPress = () => {
    console.log("Word of the Day pressed");
    // Navigate to Word of the Day screen or open a modal
  };

  return (
    <SafeAreaView style={[dynamicStyles.container, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Games</Text>
        <Text style={styles.headerSubtitle}>
          Practice your language skills with these fun activities
        </Text>
      </View>

      <View style={styles.gamesContainer}>
        {/* Word of the Day Card */}
        <TouchableOpacity
          style={styles.wordOfDayCard}
          activeOpacity={0.8}
          onPress={handleWordOfDayPress}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardIconContainer}>
              <Calendar width={24} height={24} color={BASE_COLORS.white} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Word of the Day</Text>
              <Text style={styles.cardDescription}>
                Learn a new word daily and test your knowledge
              </Text>
            </View>
          </View>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>New!</Text>
          </View>
        </TouchableOpacity>

        {/* Game Cards */}
        <View style={styles.gameCardsGrid}>
          <TouchableOpacity
            style={[styles.gameCard, styles.multipleChoiceCard]}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Multiple Choice pressed");
              router.push("/(games)/MultipleChoice");
            }}
          >
            <View style={[styles.gameCardIcon, styles.multipleChoiceIcon]}>
              <Zap width={20} height={20} color={BASE_COLORS.white} />
            </View>
            <View style={styles.gameCardTextContainer}>
              <Text style={styles.gameCardTitle}>Multiple Choice</Text>
              <Text style={styles.gameCardDescription}>
                Select the correct translation
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gameCard, styles.identificationCard]}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Identification pressed");
              router.push("/(games)/Identification");
            }}
          >
            <View style={[styles.gameCardIcon, styles.identificationIcon]}>
              <AlignCenter width={20} height={20} color={BASE_COLORS.white} />
            </View>
            <View style={styles.gameCardTextContainer}>
              <Text style={styles.gameCardTitle}>Identification</Text>
              <Text style={styles.gameCardDescription}>
                Identify the correct word
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gameCard, styles.fillBlankCard]}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Fill In The Blank pressed");
              router.push("/(games)/FillInTheBlank");
            }}
          >
            <View style={[styles.gameCardIcon, styles.fillBlankIcon]}>
              <Edit3 width={20} height={20} color={BASE_COLORS.white} />
            </View>
            <View style={styles.gameCardTextContainer}>
              <Text style={styles.gameCardTitle}>Fill In The Blank</Text>
              <Text style={styles.gameCardDescription}>
                Complete the sentence
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Games;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 10,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.8,
  },
  gamesContainer: {
    flex: 1,
  },
  wordOfDayCard: {
    backgroundColor: BASE_COLORS.blue,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.9,
  },
  cardBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: BASE_COLORS.orange,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  cardBadgeText: {
    color: BASE_COLORS.white,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  gameCardsGrid: {
    alignItems: "center",
    marginTop: 10,
  },
  gameCard: {
    width: "80%",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gameCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  gameCardTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.darkText,
    marginBottom: 2,
  },
  gameCardDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
    opacity: 0.8,
  },
  gameCardTextContainer: {
    flex: 1,
  },
  multipleChoiceCard: {
    backgroundColor: "#e6f7ff",
  },
  multipleChoiceIcon: {
    backgroundColor: BASE_COLORS.blue,
  },
  identificationCard: {
    backgroundColor: "#fff2e6",
  },
  identificationIcon: {
    backgroundColor: BASE_COLORS.orange,
  },
  fillBlankCard: {
    backgroundColor: "#e6fffa",
  },
  fillBlankIcon: {
    backgroundColor: "#00b894",
  },
});
