import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Text,
  TouchableOpacity,
  Easing,
  ImageSourcePropType,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import getLanguageBackground from "@/utils/getLanguageBackground";
import { FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface LanguageBottomSectionProps {
  language: string;
  handlePress: (userId: number) => void;
  recording?: boolean;
  userId: number;
  colors: any;
  showLanguageDetails: (language: string) => void;
  micAnimation: Animated.Value;
  recordingDuration?: number;
}

const LanguageBottomSection: React.FC<LanguageBottomSectionProps> = ({
  language,
  handlePress,
  recording,
  userId,
  colors: COLORS,
  showLanguageDetails,
  micAnimation,
  recordingDuration = 0,
}) => {
  // Animation for microphone icon scaling
  const micAnimationPulse = useRef(new Animated.Value(1)).current;

  // Animation for pulse shadow
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // NEW: Add state to track if icon is ready
  const [iconReady, setIconReady] = useState(true); // Start as true to avoid flash

  // Get responsive styles
  const getResponsiveStyles = () => {
    const { height, width } = Dimensions.get("window");
    const isSmallScreen = height < 700;

    return {
      bottomSectionHeight: isSmallScreen ? 70 : 90,
      micButtonSize: isSmallScreen ? 50 : 60,
      micButtonRadius: isSmallScreen ? 25 : 30,
      micIconSize: isSmallScreen ? 24 : 28,
      marginRight: isSmallScreen ? 12 : 16,
      borderRadius: isSmallScreen ? 16 : 20,
      // UPDATED: Use font sizing system
      fontSize: FONT_SIZES.sm, // Consistent language label size
      durationFontSize: FONT_SIZES.xs, // Consistent duration text size
    };
  };

  // NEW: Preload icon effect
  useEffect(() => {
    // Preload the icon immediately when component mounts
    const preloadIcon = () => {
      // Force render the icon off-screen to preload it
      setIconReady(true);
    };

    // Use immediate timeout to ensure icon loads before animation
    const timeoutId = setTimeout(preloadIcon, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Microphone icon scaling animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(micAnimationPulse, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(micAnimationPulse, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [micAnimationPulse]);

  // Pulse shadow animation
  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [recording, pulseAnim]);

  const responsiveStyles = getResponsiveStyles();

  return (
    <View
      style={[
        styles.bottomSection,
        { height: responsiveStyles.bottomSectionHeight },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.micButton,
          {
            backgroundColor: recording ? "#F82C2C" : COLORS.primary,
            width: responsiveStyles.micButtonSize,
            height: responsiveStyles.micButtonSize,
            borderRadius: responsiveStyles.micButtonRadius,
            marginRight: responsiveStyles.marginRight,
          },
        ]}
        onPress={() => handlePress(userId)}
        activeOpacity={0.8}
      >
        {/* Recording Duration Display */}
        {recording && (
          <View
            style={[
              styles.recordingInfo,
              { top: -Math.floor(responsiveStyles.micButtonSize * 0.58) },
            ]}
          >
            <Text
              style={[
                styles.durationText,
                { fontSize: responsiveStyles.durationFontSize },
              ]}
            >
              {recordingDuration.toFixed(1)}s
            </Text>
          </View>
        )}
        {recording && (
          <Animated.View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: responsiveStyles.micButtonRadius,
              backgroundColor: "rgba(248, 44, 44, 0.2)",
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2.5],
                  }),
                },
              ],
              opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 0],
              }),
            }}
          />
        )}
        {/* NEW: Conditional rendering with immediate display */}
        {iconReady && (
          <Animated.View style={{ transform: [{ scale: micAnimation }] }}>
            <Ionicons
              name={recording ? "mic" : "mic-off"}
              size={responsiveStyles.micIconSize}
              color={BASE_COLORS.white}
              allowFontScaling={false}
            />
          </Animated.View>
        )}
      </TouchableOpacity>

      <Pressable
        onPress={() => showLanguageDetails(language)}
        style={[
          styles.imageContainer,
          {
            height: responsiveStyles.bottomSectionHeight,
            borderRadius: responsiveStyles.borderRadius,
          },
        ]}
      >
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
        <View
          style={[
            styles.languageLabel,
            { borderRadius: responsiveStyles.borderRadius * 0.6 },
          ]}
        >
          <Text
            style={[
              styles.languageName,
              { fontSize: responsiveStyles.fontSize },
            ]}
          >
            {language}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  micButton: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    flex: 1,
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
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  languageName: {
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium, // UPDATED: Use font constant
  },
  // recording info
  recordingInfo: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: {
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.semiBold, // UPDATED: Use font constant
  },
  minimumText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: FONT_SIZES.sm, // UPDATED: Use font sizing system
    fontFamily: POPPINS_FONT.regular, // UPDATED: Use font constant
  },
});

export default LanguageBottomSection;
