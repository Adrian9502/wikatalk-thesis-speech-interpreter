import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Globe, Camera, Mic, Volume2, Target } from "react-native-feather";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { BASE_COLORS, HOMEPAGE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface FeaturedSectionProps {
  onNavigateToTab: (tabName: string) => void;
}

const FeaturedSection = React.memo(
  ({ onNavigateToTab }: FeaturedSectionProps) => {
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

    const features = [
      {
        icon: <Mic width={18} height={18} color={BASE_COLORS.white} />,
        title: "Speech Translation",
        description:
          "Translate your voice instantly across 10 Filipino dialects",
        gradient: HOMEPAGE_COLORS.speech,
        tabName: "Speech",
      },
      {
        icon: <Globe width={18} height={18} color={BASE_COLORS.white} />,
        title: "Text Translation",
        description: "Type and translate text between different dialects",
        gradient: HOMEPAGE_COLORS.translate,
        tabName: "Translate",
      },
      {
        icon: <Camera width={18} height={18} color={BASE_COLORS.white} />,
        title: "Image Scanner",
        description: "Scan text from images and get instant translations",
        gradient: HOMEPAGE_COLORS.scan,
        tabName: "Scan",
      },
      {
        icon: <Target width={18} height={18} color={BASE_COLORS.white} />,
        title: "Interactive Games",
        description: "Learn dialects through fun quizzes and challenges",
        gradient: HOMEPAGE_COLORS.games,
        tabName: "Games",
      },
      {
        icon: <Volume2 width={18} height={18} color={BASE_COLORS.white} />,
        title: "Pronunciation Guide",
        description: "Perfect your pronunciation with audio examples",
        gradient: HOMEPAGE_COLORS.pronounce,
        tabName: "Pronounce",
      },
    ];

    // Auto-rotation functionality
    useEffect(() => {
      const interval = setInterval(() => {
        setActiveFeatureIndex((prev) => (prev + 1) % features.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }, [features.length]);

    const handleFeaturePress = (tabName: string) => {
      onNavigateToTab(tabName);
    };

    // Manual dot press handler
    const handleDotPress = (index: number) => {
      setActiveFeatureIndex(index);
    };

    // Swipe gesture handler
    const onGestureEvent = (event: any) => {
      const { translationX, state } = event.nativeEvent;

      if (state === State.END) {
        const swipeThreshold = 50;

        if (translationX > swipeThreshold) {
          // Swipe right - go to previous
          setActiveFeatureIndex((prev) =>
            prev === 0 ? features.length - 1 : prev - 1
          );
        } else if (translationX < -swipeThreshold) {
          // Swipe left - go to next
          setActiveFeatureIndex((prev) => (prev + 1) % features.length);
        }
      }
    };

    return (
      <View style={styles.featuredSection}>
        <View style={styles.featuredHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <View style={styles.carouselDots}>
            {features.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                style={styles.dotTouchable}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === activeFeatureIndex
                          ? BASE_COLORS.white
                          : "rgba(255, 255, 255, 0.3)",
                      transform: [
                        {
                          scaleX: index === activeFeatureIndex ? 1.1 : 1,
                        },
                      ],
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PanGestureHandler onHandlerStateChange={onGestureEvent}>
          <View>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() =>
                handleFeaturePress(features[activeFeatureIndex].tabName)
              }
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={features[activeFeatureIndex].gradient}
                style={styles.featuredGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featuredDecor1} />
                <View style={styles.featuredDecor2} />
                <View style={styles.featuredContent}>
                  <View style={styles.featuredIconContainer}>
                    {features[activeFeatureIndex].icon}
                  </View>
                  <View style={styles.featuredText}>
                    <Text style={styles.featuredTitle}>
                      {features[activeFeatureIndex].title}
                    </Text>
                    <Text style={styles.featuredDescription}>
                      {features[activeFeatureIndex].description}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </PanGestureHandler>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  featuredSection: {
    marginBottom: 20,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.home.sectionTitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  carouselDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dotTouchable: {
    padding: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  featuredGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: "relative",
  },
  featuredContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featuredText: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: COMPONENT_FONT_SIZES.home.featuredTitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: COMPONENT_FONT_SIZES.home.featuredDescription,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  featuredDecor1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  featuredDecor2: {
    position: "absolute",
    bottom: -15,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

FeaturedSection.displayName = "FeaturedSection";
export default FeaturedSection;
