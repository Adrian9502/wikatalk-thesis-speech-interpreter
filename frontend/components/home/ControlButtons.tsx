import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Text,
} from "react-native";
import { Trash, Copy, Check, Info, Mic, MicOff } from "react-native-feather";
import { ControlButtonsProps } from "@/types/types";

const ControlButtons: React.FC<ControlButtonsProps> = ({
  // Basic properties
  showInfoHandler,
  copyHandler,
  clearTextHandler,
  micPressHandler,

  // Data needed for handlers
  languageValue,
  textValue,
  position,

  // Recording state
  isRecording,
  activeUser,
  userId,

  // Optional props with default values
  buttonBgColor = "rgba(255, 215, 0, 0.2)",
  successColor = "#28A745",
}) => {
  // State to track if content was just copied
  const [copied, setCopied] = useState(false);

  // Timer state for recording duration
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Blinking animation for REC indicator
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Current recording state
  const isCurrentlyRecording = isRecording && activeUser === userId;

  // Format seconds into MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle copy with feedback
  const handleCopy = () => {
    copyHandler(textValue);
    setCopied(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Start/stop recording timer
  useEffect(() => {
    if (isCurrentlyRecording) {
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start blinking animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);

      // Stop blinking animation
      blinkAnim.stopAnimation();
      blinkAnim.setValue(1);
    }

    // Clean up
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      blinkAnim.stopAnimation();
    };
  }, [isCurrentlyRecording]);

  return (
    <View style={styles.container}>
      {/* Language info button */}
      <TouchableOpacity
        onPress={() => showInfoHandler(languageValue, position)}
        style={[styles.iconButton, { backgroundColor: buttonBgColor }]}
      >
        <Info width={22} height={22} strokeWidth={2} stroke="#FFD700" />
      </TouchableOpacity>

      {/* Copy Icon with success feedback */}
      <TouchableOpacity
        onPress={handleCopy}
        style={[styles.iconButton, { backgroundColor: buttonBgColor }]}
      >
        {copied ? (
          <Check
            width={20}
            height={20}
            strokeWidth={2.5}
            stroke={successColor}
          />
        ) : (
          <Copy width={22} height={22} strokeWidth={2} stroke="#FFD700" />
        )}
      </TouchableOpacity>

      {/* Delete Icon */}
      <TouchableOpacity
        onPress={() => clearTextHandler(position)}
        style={[styles.iconButton, { backgroundColor: buttonBgColor }]}
      >
        <Trash width={22} height={22} strokeWidth={2} stroke="#FFD700" />
      </TouchableOpacity>

      {/* Recording Button with Status */}
      <View style={styles.recordingContainer}>
        {/* Main Button */}
        <TouchableOpacity
          style={[
            styles.micButton,
            isCurrentlyRecording
              ? styles.recordingActive
              : styles.recordingInactive,
          ]}
          onPress={() => micPressHandler(Number(userId))}
          activeOpacity={0.7}
        >
          {/* Mic Icon - changes based on recording state */}
          {isCurrentlyRecording ? (
            <Mic width={32} height={32} strokeWidth={2} stroke="#FFF" />
          ) : (
            <MicOff width={32} height={32} strokeWidth={2} stroke="#FFD700" />
          )}
        </TouchableOpacity>

        {/* Recording indicator with timer (only shown when recording) */}
        {isCurrentlyRecording && (
          <View style={styles.recordingInfo}>
            <View style={styles.recIndicator}>
              <Animated.View style={[styles.recDot, { opacity: blinkAnim }]} />
              <Animated.Text style={[styles.recText, { opacity: blinkAnim }]}>
                REC
              </Animated.Text>
            </View>
            <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 5,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
    marginRight: 12,
  },
  recordingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    width: 54,
    height: 54,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingActive: {
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#facc15",
  },
  recordingInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  recordingInfo: {
    position: "absolute",
    bottom: -27,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  recIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 4,
  },
  recText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "bold",
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default ControlButtons;
