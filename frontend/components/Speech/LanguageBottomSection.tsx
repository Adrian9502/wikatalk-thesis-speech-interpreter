import React, { useEffect, useRef } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import getLanguageBackground from "@/utils/getLanguageBackground";

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
  return (
    <View style={styles.bottomSection}>
      <TouchableOpacity
        style={[
          styles.micButton,
          {
            backgroundColor: recording ? "#F82C2C" : COLORS.primary,
          },
        ]}
        onPress={() => handlePress(userId)}
        activeOpacity={0.8}
      >
        {/* Recording Duration Display */}
        {recording && (
          <View style={styles.recordingInfo}>
            <Text style={styles.durationText}>
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
              borderRadius: 50,
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
        <Animated.View style={{ transform: [{ scale: micAnimation }] }}>
          <MaterialCommunityIcons
            name={recording ? "microphone" : "microphone-off"}
            size={28}
            color={BASE_COLORS.white}
          />
        </Animated.View>
      </TouchableOpacity>

      <Pressable
        onPress={() => showLanguageDetails(language)}
        style={styles.imageContainer}
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
        <View style={styles.languageLabel}>
          <Text style={styles.languageName}>{language}</Text>
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
    borderRadius: 20,
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
    borderRadius: 20,
  },
  languageName: {
    color: BASE_COLORS.white,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  // Add styles for recording info
  recordingInfo: {
    position: "absolute",
    top: -35,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: {
    color: BASE_COLORS.white,
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
  },
  minimumText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    fontFamily: "Poppins-Regular",
  },
});

export default LanguageBottomSection;
