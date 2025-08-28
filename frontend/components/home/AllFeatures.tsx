import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Globe, Camera, Mic, Volume2, Target } from "react-native-feather";
import { BASE_COLORS, HOMEPAGE_COLORS } from "@/constant/colors";

interface AllFeaturesProps {
  onNavigateToTab: (tabName: string) => void;
}

const AllFeatures = React.memo(({ onNavigateToTab }: AllFeaturesProps) => {
  const features = [
    {
      icon: <Mic width={18} height={18} color={BASE_COLORS.white} />,
      title: "Speech Translation",
      description: "Translate your voice instantly across 10 Filipino dialects",
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

  const handleFeaturePress = (tabName: string) => {
    onNavigateToTab(tabName);
  };

  return (
    <View style={styles.allFeaturesSection}>
      <Text style={styles.sectionTitle}>All Features</Text>
      {features.map((feature, index) => (
        <TouchableOpacity
          key={index}
          style={styles.featureCard}
          onPress={() => handleFeaturePress(feature.tabName)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={feature.gradient}
            style={styles.featureGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.featureDecor1} />
            <View style={styles.featureDecor2} />
            <View style={styles.featureIconContainer}>{feature.icon}</View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  allFeaturesSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 16,
    color: BASE_COLORS.white,
  },
  featureCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  featureGradient: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: 80,
    position: "relative",
    justifyContent: "center",
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 14,
    marginBottom: 2,
  },
  featureDecor1: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  featureDecor2: {
    position: "absolute",
    bottom: -10,
    right: 25,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
});

AllFeatures.displayName = "AllFeatures";
export default AllFeatures;
