import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@/styles/globalStyles";
import { BASE_COLORS } from "@/constant/colors";
import { useScanTranslateStore } from "@/store/useScanTranslateStore";
import { useImageProcessing } from "@/hooks/useImageProcessing";
import DotsLoader from "@/components/DotLoader";
import LanguageSelector from "@/components/Scan/LanguageSelector";
import TextDisplay from "@/components/Scan/TextDisplay";
import CameraControls from "@/components/Scan/CameraControls";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
// Define types for the state and hook returns
interface ScanTranslateState {
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
  isSourceSpeaking: boolean; // Updated property
  isTargetSpeaking: boolean; // Updated property
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
  handleSourceSpeech: (text: string) => void; // Updated method
  handleTargetSpeech: (text: string) => void; // Updated method
  stopSpeech: () => void;
}

const Scan: React.FC = () => {
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
    isSourceSpeaking, // Updated property
    isTargetSpeaking, // Updated property
    clearText,
    updateState,
    translateDetectedText,
    debouncedTranslateText,
    copyToClipboard,
    handleSourceSpeech, // Updated method
    handleTargetSpeech, // Updated method
    stopSpeech,
    copiedSource,
    copiedTarget,
  } = useScanTranslateStore() as ScanTranslateState;

  const { isProcessing, ocrProgress, processImage, recognizeText } =
    useImageProcessing();

  useEffect(() => {
    clearText();
    return () => stopSpeech();
  }, []);

  // Function to capture image and process it
  const takePicture = async (): Promise<void> => {
    if (isProcessing || !cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) throw new Error("Could not get photo URI");

      const extractedText = await recognizeText(photo.uri);

      if (extractedText) {
        await translateDetectedText(extractedText); // Use immediate translation here
      } else {
        updateState({ sourceText: "No text detected", translatedText: "" });
      }
    } catch (error) {
      updateState({
        sourceText: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        translatedText: "",
      });
    }
  };

  // Function to pick image from gallery
  const pickImage = async (): Promise<void> => {
    if (isProcessing) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const extractedText = await recognizeText(result.assets[0].uri);

        if (extractedText) {
          await translateDetectedText(extractedText); // Use immediate translation here
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
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.cameraContainer}>
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
              title="Detected Text:"
              text={sourceText}
              placeholder="Scan or select an image to detect text"
              isLoading={isProcessing}
              isSpeaking={isSourceSpeaking} // Updated property
              copied={copiedSource}
              onChangeText={(text: string) => {
                // Use debounced translation here instead of immediate translation
                debouncedTranslateText(text);
              }}
              onCopy={() => copyToClipboard(sourceText, "copiedSource")}
              onSpeak={() => handleSourceSpeech(sourceText)} // Updated method
              onClear={clearText}
              editable={true}
              color={BASE_COLORS.blue}
            />

            <TextDisplay
              title="Translation:"
              text={translatedText}
              placeholder="Translation will appear here"
              isLoading={isTranslating}
              isSpeaking={isTargetSpeaking} // Updated property
              copied={copiedTarget}
              onCopy={() => copyToClipboard(translatedText, "copiedTarget")}
              onSpeak={() => handleTargetSpeech(translatedText)} // Updated method
              editable={false}
              color={BASE_COLORS.orange}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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
    borderRadius: 8,
  },
  permissionButtonText: {
    color: BASE_COLORS.blue,
    fontFamily: "Poppins-SemiBold",
  },
  cameraContainer: {
    flex: 1,
  },
  cameraViewContainer: {
    height: "40%",
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "white",
    shadowColor: "#000",
    elevation: 3,
  },
  translationContainer: {
    flex: 1,
    marginVertical: 10,
    backgroundColor: BASE_COLORS.lightBlue,
    borderRadius: 12,
    padding: 16,
    paddingTop: 20,
    shadowColor: "#000",
    elevation: 3,
  },
  progressContainer: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.orange,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
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
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
});
