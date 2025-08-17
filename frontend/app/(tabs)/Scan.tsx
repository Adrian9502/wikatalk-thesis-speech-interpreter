import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_COLORS } from "@/constant/colors";
import { useScanTranslateStore } from "@/store/useScanTranslateStore";
import { useImageProcessing } from "@/hooks/useImageProcessing";
import DotsLoader from "@/components/DotLoader";
import LanguageSelector from "@/components/scan/LanguageSelector";
import TextDisplay from "@/components/scan/TextDisplay";
import CameraControls from "@/components/scan/CameraControls";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { globalSpeechManager } from "@/utils/globalSpeechManager";
import { useFocusEffect } from "@react-navigation/native";

// Define types for the state and hook returns
interface ScanTranslateState {
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
  isSourceSpeaking: boolean;
  isTargetSpeaking: boolean;
  copiedSource: boolean;
  copiedTarget: boolean;
  clearText: () => void;
  updateState: (state: Partial<ScanTranslateState>) => void;
  translateDetectedText: (text: string) => Promise<void>;
  debouncedTranslateText: (text: string) => void;
  copyToClipboard: (
    text: string,
    field: "copiedSource" | "copiedTarget"
  ) => void;
  handleSourceSpeech: (text: string) => void;
  handleTargetSpeech: (text: string) => void;
  stopSpeech: () => void;
}

const Scan: React.FC = () => {
  // stop ongoing speech
  useFocusEffect(
    React.useCallback(() => {
      console.log("[Scan] Tab focused, stopping all speech");
      globalSpeechManager.stopAllSpeech();

      return () => {
        console.log("[Scan] Tab losing focus");
        globalSpeechManager.stopAllSpeech();
      };
    }, [])
  );
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const {
    targetLanguage,
    sourceText,
    translatedText,
    isTranslating,
    isSourceSpeaking,
    isTargetSpeaking,
    clearText,
    updateState,
    translateDetectedText,
    debouncedTranslateText,
    copyToClipboard,
    handleSourceSpeech,
    handleTargetSpeech,
    stopSpeech,
    copiedSource,
    copiedTarget,
  } = useScanTranslateStore() as ScanTranslateState;

  const { isProcessing, ocrProgress, recognizeText } = useImageProcessing();

  // NEW: Simple animation refs - only fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationStartedRef = useRef(false);

  useEffect(() => {
    clearText();
    return () => stopSpeech();
  }, []);

  // NEW: Simple fade-in animation on component mount
  useEffect(() => {
    if (!animationStartedRef.current) {
      animationStartedRef.current = true;

      // Simple fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim]);

  // Function to capture image and process it
  const takePicture = async (): Promise<void> => {
    if (!cameraRef.current) {
      console.log("Camera not ready");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        const extractedText = await recognizeText(photo.uri);

        if (extractedText) {
          await translateDetectedText(extractedText);
        } else {
          updateState({ sourceText: "No text detected", translatedText: "" });
        }
      }
    } catch (error) {
      updateState({
        sourceText: `Error capturing image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        translatedText: "",
      });
    }
  };

  // Function to pick image from gallery
  const pickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const extractedText = await recognizeText(result.assets[0].uri);

        if (extractedText) {
          await translateDetectedText(extractedText);
        } else {
          updateState({ sourceText: "No text detected", translatedText: "" });
        }
      }
    } catch (error) {
      updateState({
        sourceText: `Error processing image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        translatedText: "",
      });
    }
  };

  // Render permission request screen
  if (!permission) {
    return (
      <SafeAreaView style={[dynamicStyles.container, styles.centeredContainer]}>
        <StatusBar style="light" />
        <DotsLoader />
      </SafeAreaView>
    );
  }

  // Render camera permission request
  if (!permission.granted) {
    return (
      <SafeAreaView style={[dynamicStyles.container, styles.centeredContainer]}>
        <StatusBar style="light" />
        <Text style={styles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={dynamicStyles.container}
      onStartShouldSetResponder={() => true}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <StatusBar style="light" />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            enabled={true}
          >
            {/* NEW: Simple fade animation wrapper - no other changes */}
            <Animated.View
              style={[
                styles.cameraContainer,
                {
                  opacity: fadeAnim, // Only add fade animation
                },
              ]}
            >
              <View style={styles.cameraViewContainer}>
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  ref={cameraRef}
                  onMountError={(event) => {
                    const error = event as unknown as Error;
                    updateState({
                      sourceText: `Camera mount error: ${error.message}`,
                    });
                  }}
                />

                <CameraControls
                  takePicture={takePicture}
                  pickImage={pickImage}
                  isProcessing={isProcessing}
                />
              </View>

              <View style={styles.translationContainer}>
                <LanguageSelector
                  targetLanguage={targetLanguage}
                  onLanguageChange={(language: string) => {
                    updateState({ targetLanguage: language });
                    if (sourceText) translateDetectedText(sourceText);
                  }}
                />

                {isProcessing && (
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${ocrProgress * 100}%` },
                      ]}
                    />
                    <Text style={styles.progressText}>
                      {Math.round(ocrProgress * 100)}% - Recognizing text...
                    </Text>
                  </View>
                )}

                <TextDisplay
                  title="Detected Text"
                  text={sourceText}
                  placeholder="Scan or select an image to detect text"
                  isLoading={isProcessing}
                  isSpeaking={isSourceSpeaking}
                  copied={copiedSource}
                  onChangeText={(text: string) => {
                    debouncedTranslateText(text);
                  }}
                  onCopy={() => copyToClipboard(sourceText, "copiedSource")}
                  onSpeak={() => handleSourceSpeech(sourceText)}
                  onClear={clearText}
                  editable={true}
                  color={BASE_COLORS.blue}
                />

                <TextDisplay
                  title="Translation"
                  text={translatedText}
                  placeholder="Translation will appear here"
                  isLoading={isTranslating}
                  isSpeaking={isTargetSpeaking}
                  copied={copiedTarget}
                  onCopy={() => copyToClipboard(translatedText, "copiedTarget")}
                  onSpeak={() => handleTargetSpeech(translatedText)}
                  editable={false}
                  color={BASE_COLORS.orange}
                />
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default Scan;

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  centeredContainer: {
    justifyContent: "center",
    gap: 100,
    alignItems: "center",
  },
  permissionText: {
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    paddingBottom: 4,
    fontSize: 15,
  },
  permissionButton: {
    padding: 14,
    backgroundColor: BASE_COLORS.lightBlue,
    borderRadius: 20,
  },
  permissionButtonText: {
    color: BASE_COLORS.blue,
    fontFamily: "Poppins-SemiBold",
  },
  cameraContainer: {
    flex: 1,
  },
  cameraViewContainer: {
    height: "35%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    elevation: 3,
  },
  translationContainer: {
    flex: 1,
    marginVertical: 16,
    backgroundColor: BASE_COLORS.lightBlue,
    borderRadius: 20,
    padding: 16,
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    minHeight: 350, // Increased minimum height for better text display
    maxHeight: "65%", // Limit maximum height to prevent overflow
  },
  progressContainer: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.orange,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    marginBottom: 8, // Add margin for better spacing
  },
  progressBar: {
    height: "100%",
    backgroundColor: BASE_COLORS.blue,
    borderRadius: 10,
  },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "white",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
});
