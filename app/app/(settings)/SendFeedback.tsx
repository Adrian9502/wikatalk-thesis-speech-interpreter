import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";
import { Send, AlertCircle, MessageSquare, X } from "react-native-feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import showNotification from "@/lib/showNotification";
import { feedbackService } from "@/services/api/feedbackService";
import { Header } from "@/components/Header";
import { router } from "expo-router";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";

const SendFeedback = () => {
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  const insets = useSafeAreaInsets();

  const [feedbackType, setFeedbackType] = useState<"bug" | "suggestion" | "">(
    ""
  );
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    {
      id: "bug",
      label: "Bug Report",
      iconName: "bug",
      description: "Found an issue?",
    },
    {
      id: "suggestion",
      label: "Feature Request",
      iconName: "lightbulb-on",
      description: "Share your ideas",
    },
  ];

  const handleBackPress = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!feedbackType || !title.trim() || !message.trim()) {
      showNotification({
        type: "error",
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await feedbackService.sendFeedback({
        feedbackType: feedbackType as "bug" | "suggestion",
        title: title.trim(),
        message: message.trim(),
      });

      if (result.success) {
        showNotification({
          type: "success",
          title: "Feedback Sent!",
          description:
            result.message ||
            "Thank you for your feedback! We'll review it soon.",
        });

        // Clear form and go back
        setFeedbackType("");
        setTitle("");
        setMessage("");
        router.back();
      } else {
        throw new Error(result.message || "Failed to send feedback");
      }
    } catch (error: any) {
      console.error("Error sending feedback:", error);
      showNotification({
        type: "error",
        title: "Send Failed",
        description:
          error.message || "Unable to send feedback. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearTitle = () => {
    setTitle("");
  };

  const clearMessage = () => {
    setMessage("");
  };

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={[dynamicStyles.container, { paddingTop: insets.top }]}
    >
      <StatusBar style="light" />

      {/* Header */}
      <Header title="Send Feedback" onBackPress={handleBackPress} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          bounces={false}
          overScrollMode="never"
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Feedback Type Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
                Feedback Type
              </Text>
              <View style={styles.typeContainer}>
                {feedbackTypes.map((type) => {
                  const isSelected = feedbackType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeCard,
                        isSelected && styles.typeCardSelected,
                      ]}
                      onPress={() =>
                        setFeedbackType(type.id as "bug" | "suggestion")
                      }
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.iconContainer,
                          isSelected && styles.iconContainerSelected,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={type.iconName}
                          size={18}
                          color={
                            isSelected ? BASE_COLORS.white : BASE_COLORS.blue
                          }
                        />
                      </View>
                      <View style={styles.typeInfo}>
                        <Text
                          style={[
                            styles.typeLabel,
                            isSelected && styles.typeLabelSelected,
                          ]}
                        >
                          {type.label}
                        </Text>
                        <Text
                          style={[
                            styles.typeDescription,
                            isSelected && styles.typeDescriptionSelected,
                          ]}
                        >
                          {type.description}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.selectionIndicator,
                          isSelected && styles.selectionIndicatorSelected,
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Title Input */}
            <View style={styles.section}>
              <View style={styles.titleInputContainer}>
                <AlertCircle width={14} height={14} color={BASE_COLORS.white} />
                <Text style={styles.sectionTitle}>Title *</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.titleInput}
                  placeholder={`Brief ${
                    feedbackType === "bug"
                      ? "bug description"
                      : "feature request"
                  }`}
                  placeholderTextColor={BASE_COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
                {title.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearTitle}
                    activeOpacity={0.7}
                  >
                    <X
                      width={13}
                      height={13}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Message Input */}
            <View style={styles.section}>
              <View style={styles.titleInputContainer}>
                <MessageSquare
                  width={14}
                  height={14}
                  color={BASE_COLORS.white}
                />
                <Text style={styles.sectionTitle}>
                  {feedbackType === "bug" ? "Bug Details" : "Description"} *
                </Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder={
                    feedbackType === "bug"
                      ? "Describe the bug: what happened, expected behavior, steps to reproduce..."
                      : "Describe your feature request in detail..."
                  }
                  placeholderTextColor={BASE_COLORS.placeholderText}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={1000}
                />
                {message.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButtonMessage}
                    onPress={clearMessage}
                    activeOpacity={0.7}
                  >
                    <X
                      width={13}
                      height={13}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </TouchableOpacity>
                )}
                <View style={styles.inputFooter}>
                  <Text style={styles.characterCount}>
                    {message.length}/1000
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Your feedback helps us improve WikaTalk. We review all
                submissions and appreciate your input!
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button - Fixed at bottom */}
        <View
          style={[
            styles.footer,
            { backgroundColor: activeTheme.backgroundColor },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!feedbackType || !title.trim() || !message.trim()) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={
              isSubmitting || !feedbackType || !title.trim() || !message.trim()
            }
            activeOpacity={0.8}
          >
            <Send
              width={16}
              height={16}
              color={BASE_COLORS.white}
              style={styles.submitIcon}
            />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },
  titleInputContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  typeContainer: {
    gap: 16,
  },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    position: "relative",
  },
  typeCardSelected: {
    borderColor: BASE_COLORS.blue,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconContainerSelected: {
    backgroundColor: BASE_COLORS.blue,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginBottom: 2,
  },
  typeLabelSelected: {
    color: BASE_COLORS.blue,
  },
  typeDescription: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.6)",
  },
  typeDescriptionSelected: {
    color: "rgba(59, 130, 246, 0.8)",
  },
  selectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  selectionIndicatorSelected: {
    backgroundColor: BASE_COLORS.blue,
  },
  inputContainer: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    position: "relative",
  },
  titleInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: COMPONENT_FONT_SIZES.input.text,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    minHeight: 48,
  },
  messageInput: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    paddingRight: 50,
    fontSize: COMPONENT_FONT_SIZES.input.text,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    minHeight: 120,
  },
  clearButton: {
    position: "absolute",
    right: 16,
    top: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonMessage: {
    position: "absolute",
    right: 16,
    top: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputFooter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  characterCount: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "right",
  },
  infoCard: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.blue,
  },
  infoText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BASE_COLORS.blue,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0.5,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
  },
});

export default SendFeedback;
