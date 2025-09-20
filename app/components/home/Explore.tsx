import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Globe, Camera, Mic, Volume2, Target } from "react-native-feather";
import { BASE_COLORS, HOMEPAGE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface ExploreProps {
  onNavigateToTab: (tabName: string) => void;
}

const { width: screenWidth } = Dimensions.get("window");

const Explore = React.memo(({ onNavigateToTab }: ExploreProps) => {
  // Grid configuration
  const SIDE_PADDING = 20;
  const CARD_SPACING = 12;
  const ITEMS_PER_ROW = 3;

  // Calculate card width based on screen size
  const getCardWidth = () => {
    const availableWidth =
      screenWidth - SIDE_PADDING * 2 - CARD_SPACING * (ITEMS_PER_ROW - 1);
    return availableWidth / ITEMS_PER_ROW;
  };

  const CARD_WIDTH = getCardWidth();

  const features = [
    {
      icon: <Ionicons name="mic-outline" size={24} color={BASE_COLORS.white} />,
      title: "Speech",
      // BLUE
      gradient: HOMEPAGE_COLORS.speech,
      tabName: "Speech",
      shadowColor: "#3b82f6",
    },
    {
      icon: (
        <MaterialIcons name="translate" size={24} color={BASE_COLORS.white} />
      ),
      title: "Translate",
      // RED
      gradient: HOMEPAGE_COLORS.translate,
      tabName: "Translate",
      shadowColor: "#ef4444",
    },
    {
      icon: (
        <Ionicons name="camera-outline" size={24} color={BASE_COLORS.white} />
      ),
      title: "Scan",
      // YELLOW
      gradient: HOMEPAGE_COLORS.scan,
      tabName: "Scan",
      shadowColor: "#f59e0b",
    },
    {
      icon: (
        <Ionicons
          name="game-controller-outline"
          size={24}
          color={BASE_COLORS.white}
        />
      ),
      title: "Games",
      // RED
      gradient: HOMEPAGE_COLORS.games,
      tabName: "Games",
      shadowColor: "#ef4444",
    },
    {
      icon: (
        <Ionicons
          name="volume-high-outline"
          size={24}
          color={BASE_COLORS.white}
        />
      ),
      title: "Pronounce",
      // BLUE
      gradient: HOMEPAGE_COLORS.pronounce,
      tabName: "Pronounce",
      shadowColor: "#3b82f6",
    },
  ];

  const handleFeaturePress = (tabName: string) => {
    onNavigateToTab(tabName);
  };

  // Create rows from features array
  const createRows = () => {
    const rows = [];
    for (let i = 0; i < features.length; i += ITEMS_PER_ROW) {
      rows.push(features.slice(i, i + ITEMS_PER_ROW));
    }
    return rows;
  };

  const renderFeatureCard = (
    feature: any,
    index: number,
    rowIndex: number,
    itemIndex: number
  ) => {
    const isLastInRow = itemIndex === ITEMS_PER_ROW - 1;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.featureCard,
          { width: CARD_WIDTH },
          !isLastInRow && { marginRight: CARD_SPACING },
        ]}
        onPress={() => handleFeaturePress(feature.tabName)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={feature.gradient}
          style={styles.featureGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>{feature.icon}</View>
          <Text style={styles.featureTitle}>{feature.title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderRow = (rowFeatures: any[], rowIndex: number) => {
    // Check if this row has fewer items than the maximum
    const isIncompleteRow = rowFeatures.length < ITEMS_PER_ROW;

    return (
      <View
        key={rowIndex}
        style={[
          styles.row,
          // Center incomplete rows
          isIncompleteRow && styles.centeredRow,
        ]}
      >
        {rowFeatures.map((feature, itemIndex) => {
          const globalIndex = rowIndex * ITEMS_PER_ROW + itemIndex;
          return renderFeatureCard(feature, globalIndex, rowIndex, itemIndex);
        })}
      </View>
    );
  };

  const rows = createRows();

  return (
    <View style={styles.ExploreSection}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Explore</Text>
      </View>

      {/* Grid Layout */}
      <View style={styles.gridContainer}>
        {rows.map((rowFeatures, rowIndex) => renderRow(rowFeatures, rowIndex))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  ExploreSection: {
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.home.sectionTitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  gridContainer: {
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  centeredRow: {
    justifyContent: "center",
  },
  featureCard: {
    height: 100,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  featureGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: COMPONENT_FONT_SIZES.home.featuredTitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
    lineHeight: 14,
  },
});

Explore.displayName = "Explore";
export default Explore;
