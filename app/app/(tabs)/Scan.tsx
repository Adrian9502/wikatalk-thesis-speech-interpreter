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
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BASE_COLORS } from "@/constants/colors";
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
import {
  FONT_SIZES,
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
} from "@/constants/fontSizes";
import { TutorialTarget } from "@/components/tutorial/TutorialTarget";
import { useTutorial } from "@/context/TutorialContext";
import { SCAN_TUTORIAL } from "@/constants/tutorials";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check if it's a small screen (like Nexus 4)
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280;
const isMediumScreen = screenWidth <= 414 && screenHeight <= 896;

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
  resetSpeechStates: () => void;
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
  // Theme and utility hooks first
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  const insets = useSafeAreaInsets();

  // Camera and permissions hooks
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  // Store hooks
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
    resetSpeechStates,
    copiedSource,
    copiedTarget,
  } = useScanTranslateStore() as ScanTranslateState;

  // Processing hooks
  const { isProcessing, ocrProgress, recognizeText } = useImageProcessing();
  const { startTutorial, shouldShowTutorial } = useTutorial();

  // Then update the useFocusEffect:
  useFocusEffect(
    React.useCallback(() => {
      console.log(
        "[Scan] Tab focused, stopping all speech and resetting states"
      );
      globalSpeechManager.stopAllSpeech();
      resetSpeechStates();

      // ENHANCED: Check tutorial status asynchronously
      const checkAndStartTutorial = async () => {
        if (permission?.granted) {
          try {
            const shouldShow = await shouldShowTutorial(
              SCAN_TUTORIAL.id,
              SCAN_TUTORIAL.version
            );
            if (shouldShow) {
              const timer = setTimeout(() => {
                startTutorial(SCAN_TUTORIAL);
              }, 500);

              return () => {
                clearTimeout(timer);
                console.log("[Scan] Tab losing focus");
                globalSpeechManager.stopAllSpeech();
                resetSpeechStates();
              };
            }
          } catch (error) {
            console.error("[Scan] Error checking tutorial status:", error);
          }
        }
      };

      checkAndStartTutorial();

      return () => {
        console.log("[Scan] Tab losing focus");
        globalSpeechManager.stopAllSpeech();
        resetSpeechStates();
      };
    }, [
      resetSpeechStates,
      startTutorial,
      shouldShowTutorial,
      permission?.granted,
    ])
  );

  // Effects - always in same order
  useEffect(() => {
    clearText();
    return () => stopSpeech();
  }, [clearText, stopSpeech]);

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

  // Enhanced permission request handler that also triggers tutorial
  const handlePermissionRequest = async () => {
    const permissionResult = await requestPermission();

    // If permission is granted and tutorial hasn't been completed, start it
    if (permissionResult.granted && !shouldShowTutorial(SCAN_TUTORIAL.id)) {
      setTimeout(() => {
        startTutorial(SCAN_TUTORIAL);
      }, 800); // Delay to allow camera to initialize
    }
  };

  // Get responsive styles based on screen size
  const getResponsiveStyles = () => {
    // Calculate available height for layout (subtract safe area and some padding)
    const availableHeight = screenHeight - insets.top - insets.bottom - 40; // 40px for padding

    return {
      // Container padding
      containerPadding: isSmallScreen ? 8 : isMediumScreen ? 12 : 16,

      // Camera view height - FIXED: Convert percentages to actual pixel values
      cameraHeight: isSmallScreen
        ? Math.floor(availableHeight * 0.28)
        : isMediumScreen
        ? Math.floor(availableHeight * 0.32)
        : Math.floor(availableHeight * 0.35),

      // Translation container
      translationMargin: isSmallScreen ? 8 : 16,
      translationPadding: isSmallScreen ? 12 : 16,
      translationPaddingTop: isSmallScreen ? 16 : 20,

      // Min height for translation container
      translationMinHeight: isSmallScreen ? 280 : 350,

      // Max height for translation container - FIXED: Convert to pixel values
      translationMaxHeight: isSmallScreen
        ? Math.floor(availableHeight * 0.7)
        : Math.floor(availableHeight * 0.65),
    };
  };

  const responsiveStyles = getResponsiveStyles();

  // Render permission request screen
  if (!permission) {
    return (
      <SafeAreaView
        edges={["left", "right"]}
        style={[
          dynamicStyles.container,
          styles.centeredContainer,
          { paddingTop: insets.top },
        ]}
      >
        <DotsLoader />
      </SafeAreaView>
    );
  }

  // Render camera permission request
  if (!permission.granted) {
    return (
      <SafeAreaView
        edges={["left", "right"]}
        style={[
          dynamicStyles.container,
          styles.centeredContainer,
          { paddingTop: insets.top },
        ]}
      >
        <Text style={styles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePermissionRequest}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <Text style={styles.permissionNote}>
          Don't worry! You can still use the gallery feature to scan images once
          permission is granted.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      onStartShouldSetResponder={() => true}
      edges={["left", "right"]}
      style={[
        dynamicStyles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
            keyboardVerticalOffset={
              Platform.OS === "ios" ? 0 : isSmallScreen ? 10 : 20
            }
            enabled={true}
          >
            <View style={styles.cameraContainer}>
              {/* Camera Section */}
              <TutorialTarget id="scan-camera-section">
                <View
                  style={[
                    styles.cameraViewContainer,
                    { height: responsiveStyles.cameraHeight },
                  ]}
                >
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
              </TutorialTarget>

              {/* Translation Section - FIXED: Proper flex structure */}
              <TutorialTarget
                id="scan-translation-section"
                style={styles.translationTutorialWrapper}
              >
                <View
                  style={[
                    styles.translationContainer,
                    {
                      marginVertical: responsiveStyles.translationMargin,
                      padding: responsiveStyles.translationPadding,
                      paddingTop: responsiveStyles.translationPaddingTop,
                      minHeight: responsiveStyles.translationMinHeight,
                      maxHeight: responsiveStyles.translationMaxHeight,
                    },
                  ]}
                >
                  <LanguageSelector
                    targetLanguage={targetLanguage}
                    onLanguageChange={(language: string) => {
                      updateState({ targetLanguage: language });
                      if (sourceText) translateDetectedText(sourceText);
                    }}
                  />

                  {isProcessing && (
                    <View
                      style={[
                        styles.progressContainer,
                        { marginBottom: isSmallScreen ? 6 : 8 },
                      ]}
                    >
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

                  {/* Text Display Areas - FIXED: Proper flex structure */}
                  <View style={styles.textDisplayContainer}>
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
                      language={targetLanguage}
                      onCopy={() =>
                        copyToClipboard(translatedText, "copiedTarget")
                      }
                      onSpeak={() => handleTargetSpeech(translatedText)}
                      editable={false}
                      color={BASE_COLORS.orange}
                    />
                  </View>
                </View>
              </TutorialTarget>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  centeredContainer: {
    justifyContent: "center",
    gap: 20,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  permissionText: {
    textAlign: "center",
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    paddingBottom: 4,
    fontSize: COMPONENT_FONT_SIZES.translation.language,
  },
  permissionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: BASE_COLORS.lightBlue,
    borderRadius: 20,
    marginBottom: 10,
  },
  permissionButtonText: {
    color: BASE_COLORS.blue,
    fontFamily: POPPINS_FONT.medium,
    fontSize: COMPONENT_FONT_SIZES.button.medium,
  },
  permissionNote: {
    textAlign: "center",
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    fontSize: COMPONENT_FONT_SIZES.card.description,
    opacity: 0.8,
    paddingHorizontal: 10,
  },
  cameraContainer: {
    flex: 1,
  },
  cameraViewContainer: {
    // Height is now set dynamically via style prop using pixel values
    borderRadius: isSmallScreen ? 16 : 20,
    overflow: "hidden",
    shadowColor: "#000",
    elevation: 3,
  },
  // FIXED: Tutorial wrapper that maintains flex layout
  translationTutorialWrapper: {
    flex: 1,
  },
  translationContainer: {
    flex: 1,
    backgroundColor: BASE_COLORS.lightBlue,
    borderRadius: isSmallScreen ? 16 : 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  // ADDED: Container for text display areas
  textDisplayContainer: {
    flex: 1,
    gap: isSmallScreen ? 8 : 12,
  },
  progressContainer: {
    height: isSmallScreen ? 18 : 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.orange,
    borderRadius: isSmallScreen ? 16 : 20,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: BASE_COLORS.blue,
    borderRadius: isSmallScreen ? 8 : 10,
  },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "white",
    fontFamily: POPPINS_FONT.regular,
    fontSize: COMPONENT_FONT_SIZES.translation.pronunciation,
  },
});

export default Scan;
