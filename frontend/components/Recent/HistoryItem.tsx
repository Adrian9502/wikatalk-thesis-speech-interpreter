import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-feather";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { HistoryItemType } from "@/types/types";
import TranslationText from "./TranslationText";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HistoryItemProps {
  item: HistoryItemType;
  onDeletePress: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onDeletePress }) => {
  const [expanded, setExpanded] = useState(false);
  const [needsExpandButton, setNeedsExpandButton] = useState(false);
  const contentRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Check if content exceeds collapsed height
  useEffect(() => {
    // Reset measurement when item changes
    setNeedsExpandButton(false);

    // Use a small delay to ensure content is properly laid out
    const timer = setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.measure((x, y, width, height, pageX, pageY) => {
          // Only show the expand button if content height exceeds our threshold
          setNeedsExpandButton(height > 120);
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [item]);

  const toggleExpansion = () => {
    // Start fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // After fade out, change the expanded state
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(!expanded);

      // Then fade back in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.historyContainer}>
      {/* Date and Delete button */}
      <View style={styles.headerContainer}>
        <View style={styles.dateContainer}>
          <Calendar
            width={14}
            height={14}
            color={BASE_COLORS.white}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => {
            console.log("[HistoryItem] Delete pressed for item ID:", item.id);
            onDeletePress(item.id);
          }}
        >
          <Ionicons name="trash-outline" size={15} color={BASE_COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Language Header */}
        <View style={styles.languageHeaderContainer}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
            style={styles.languageHeaderContent}
          >
            <View style={styles.languageBlock}>
              <Text style={styles.languageText}>{item.fromLanguage}</Text>
            </View>

            <LinearGradient
              colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.exchangeIconContainer}
            >
              <Feather name="repeat" size={16} color={BASE_COLORS.white} />
            </LinearGradient>

            <View style={styles.languageBlock}>
              <Text style={styles.languageText}>{item.toLanguage}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Translation Content with Fade Animation */}
        <Pressable onPress={needsExpandButton ? toggleExpansion : undefined}>
          <Animated.View
            style={[
              styles.translationContainer,
              styles.collapsedContainer,
              { opacity: fadeAnim },
            ]}
          >
            <View ref={contentRef} style={styles.translationInnerContainer}>
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

            {/* Gradient fade when collapsed */}
            {!expanded && needsExpandButton && (
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0)",
                  "rgba(255,255,255,0.9)",
                  "rgba(255,255,255,1)",
                ]}
                style={styles.expandGradient}
              />
            )}
          </Animated.View>
        </Pressable>

        {/* Expand/Collapse Button with Animation - ONLY SHOW WHEN NEEDED */}
        {needsExpandButton && (
          <TouchableOpacity
            style={styles.expandCollapseButton}
            onPress={toggleExpansion}
            activeOpacity={0.7}
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={styles.expandCollapseText}>
                {expanded ? "Show Less" : "Show More"}
              </Text>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={BASE_COLORS.blue}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
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
    borderRadius: 20,
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dateIcon: {
    marginRight: 6,
    alignSelf: "center",
  },
  dateText: {
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    fontSize: 11,
  },
  deleteIcon: {
    padding: 5,
    backgroundColor: BASE_COLORS.orange,
    borderRadius: 20,
  },
  contentContainer: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  languageBlock: {
    alignItems: "center",
    flex: 1,
  },
  languageText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: TITLE_COLORS.customWhite,
  },
  exchangeIconContainer: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: BASE_COLORS.white,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  translationContainer: {
    position: "relative",
    overflow: "hidden",
  },
  translationInnerContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
  },
  collapsedContainer: {
    maxHeight: 120,
  },

  expandGradient: {
    height: 50,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  expandCollapseButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  expandCollapseText: {
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.blue,
    fontSize: 12,
    marginRight: 5,
  },
});

export default HistoryItem;
