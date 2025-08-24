import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-feather";
import {
  TapGestureHandler,
  State,
  TapGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
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

const HistoryItem: React.FC<HistoryItemProps> = React.memo(
  ({ item, onDeletePress }) => {
    const [expanded, setExpanded] = useState(false);
    const [needsExpandButton, setNeedsExpandButton] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const deleteScaleAnim = useRef(new Animated.Value(1)).current;

    // Gesture refs
    const contentTapRef = useRef<TapGestureHandler>(null);
    const deleteTapRef = useRef<TapGestureHandler>(null);
    const expandTapRef = useRef<TapGestureHandler>(null);

    // Memoized content measurement
    const onContentLayout = useCallback((event: any) => {
      const { height } = event.nativeEvent.layout;
      setNeedsExpandButton(height > 120);
    }, []);

    // Optimized expansion toggle
    const toggleExpansion = useCallback(() => {
      const animationConfig = {
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      };

      LayoutAnimation.configureNext(animationConfig);

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setExpanded(!expanded);
    }, [expanded, fadeAnim]);

    // Gesture handlers
    const onContentTap = useCallback(
      (event: TapGestureHandlerGestureEvent) => {
        if (event.nativeEvent.state === State.END && needsExpandButton) {
          // Scale animation for feedback
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 0.98,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();

          toggleExpansion();
        }
      },
      [needsExpandButton, toggleExpansion, scaleAnim]
    );

    const onDeleteTap = useCallback(
      (event: TapGestureHandlerGestureEvent) => {
        if (event.nativeEvent.state === State.END) {
          // Scale animation for delete button
          Animated.sequence([
            Animated.timing(deleteScaleAnim, {
              toValue: 0.9,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(deleteScaleAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onDeletePress(item.id);
          });
        }
      },
      [onDeletePress, item.id, deleteScaleAnim]
    );

    const onExpandTap = useCallback(
      (event: TapGestureHandlerGestureEvent) => {
        if (event.nativeEvent.state === State.END) {
          toggleExpansion();
        }
      },
      [toggleExpansion]
    );

    // Memoized styles for performance
    const containerStyle = useMemo(
      () => [
        styles.translationContainer,
        expanded ? undefined : styles.collapsedContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ],
      [expanded, fadeAnim, scaleAnim]
    );

    const deleteButtonStyle = useMemo(
      () => [styles.deleteIcon, { transform: [{ scale: deleteScaleAnim }] }],
      [deleteScaleAnim]
    );

    return (
      <View style={styles.historyContainer}>
        {/* Header */}
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

          <TapGestureHandler
            ref={deleteTapRef}
            onHandlerStateChange={onDeleteTap}
          >
            <Animated.View style={deleteButtonStyle}>
              <Ionicons
                name="trash-outline"
                size={15}
                color={BASE_COLORS.white}
              />
            </Animated.View>
          </TapGestureHandler>
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

          {/* Translation Content with Gesture */}
          <TapGestureHandler
            ref={contentTapRef}
            onHandlerStateChange={onContentTap}
          >
            <Animated.View style={containerStyle}>
              <View
                style={styles.translationInnerContainer}
                onLayout={onContentLayout}
              >
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
                  pointerEvents="none"
                />
              )}
            </Animated.View>
          </TapGestureHandler>

          {/* Expand/Collapse Button */}
          {needsExpandButton && (
            <TapGestureHandler
              ref={expandTapRef}
              onHandlerStateChange={onExpandTap}
            >
              <Animated.View style={styles.expandCollapseButton}>
                <Text style={styles.expandCollapseText}>
                  {expanded ? "Show Less" : "Show More"}
                </Text>
                <Ionicons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={BASE_COLORS.blue}
                />
              </Animated.View>
            </TapGestureHandler>
          )}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Optimized comparison for React.memo
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.date === nextProps.item.date &&
      prevProps.item.originalText === nextProps.item.originalText &&
      prevProps.item.translatedText === nextProps.item.translatedText
    );
  }
);

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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
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
