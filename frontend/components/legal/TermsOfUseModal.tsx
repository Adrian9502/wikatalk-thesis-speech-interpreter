import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, FileText } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import { TERMS_OF_USE_CONTENT, TERMS_OF_USE_DATE } from "@/utils/termsOfUse";
import CloseButton from "../games/buttons/CloseButton";

interface TermsOfUseModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
  title?: string;
}

const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({
  visible,
  onClose,
  onAccept,
  showAcceptButton = false,
  title = "Terms of Use",
}) => {
  const { activeTheme } = useThemeStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force ScrollView to be scrollable when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      setForceUpdate((prev) => prev + 1);

      // Multiple attempts to activate scrolling
      const timer1 = setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 1, animated: false });
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
          }, 50);
        }
      }, 100);

      const timer2 = setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.flashScrollIndicators();
        }
      }, 300);

      const timer3 = setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 2, animated: false });
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
          }, 50);
        }
      }, 500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [visible]);

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  const formatContent = (content: string) => {
    // Split content by double line breaks to create paragraphs
    const paragraphs = content.split("\n\n");

    return paragraphs.map((paragraph, index) => {
      // Check if it's a header (starts with **)
      if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
        const headerText = paragraph.replace(/\*\*/g, "");
        return (
          <Text key={index} style={styles.headerText}>
            {headerText}
          </Text>
        );
      }

      // Regular paragraph
      return (
        <Text key={index} style={styles.contentText}>
          {paragraph.replace(/\*\*/g, "")}
        </Text>
      );
    });
  };

  const handleContentSizeChange = (
    contentWidth: number,
    contentHeight: number
  ) => {
    setContentHeight(contentHeight);
    // Force scroll activation
    if (scrollViewRef.current && contentHeight > scrollViewHeight) {
      setTimeout(() => {
        scrollViewRef.current?.flashScrollIndicators();
        scrollViewRef.current?.scrollTo({ y: 1, animated: false });
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }, 10);
      }, 50);
    }
  };

  const handleScrollViewLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      supportedOrientations={["portrait"]}
      onShow={() => {
        // Additional safety - trigger scroll activation when modal shows
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 1, animated: false });
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: false });
              scrollViewRef.current?.flashScrollIndicators();
            }, 50);
          }
        }, 100);
      }}
    >
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: activeTheme.backgroundColor },
        ]}
        edges={["top", "bottom", "left", "right"]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: "rgba(255, 255, 255, 0.1)" },
          ]}
        >
          <View style={styles.headerLeft}>
            <FileText width={15} height={15} color={BASE_COLORS.white} />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <CloseButton onPress={onClose} size={15} />
        </View>

        {/* Last Updated */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>Last updated: {TERMS_OF_USE_DATE}</Text>
        </View>

        {/* Content - Key changes here */}
        <View style={styles.scrollContainer}>
          <ScrollView
            key={`scroll-${forceUpdate}`} // Force re-render
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              // Ensure minimum height for scrolling
              { minHeight: Math.max(1200, scrollViewHeight + 100) },
            ]}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={false} // Changed to false to avoid conflicts
            keyboardShouldPersistTaps="handled"
            bounces={true} // Enable bounces for better scroll detection
            overScrollMode="never" // Changed from "never"
            scrollEnabled={true}
            directionalLockEnabled={true}
            // Force enable scroll indicators
            persistentScrollbar={Platform.OS === "android"}
            indicatorStyle="white"
            scrollIndicatorInsets={{ right: 2 }}
            // Layout handler
            onLayout={handleScrollViewLayout}
            // Content size change handler
            onContentSizeChange={handleContentSizeChange}
            // Scroll handlers for debugging
            onScroll={(event) => {
              // Optional: Add scroll debugging
              // console.log('Scroll Y:', event.nativeEvent.contentOffset.y);
            }}
            scrollEventThrottle={16}
            // Additional props for better scrolling
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
          >
            <View style={styles.contentContainer}>
              {formatContent(TERMS_OF_USE_CONTENT)}
            </View>
          </ScrollView>
        </View>

        {/* Accept Button (for registration flow) */}
        {showAcceptButton && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.acceptButton,
                { backgroundColor: activeTheme.secondaryColor },
              ]}
              onPress={handleAccept}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptButtonText}>
                I Accept the Terms of Use
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.declineButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginLeft: 10,
  },
  dateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  // New container for the scroll view
  scrollContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
    flexGrow: 1, // Changed from minHeight to flexGrow
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flex: 1,
  },
  headerText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 12,
    marginTop: 20,
    lineHeight: 24,
  },
  contentText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "justify",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  acceptButton: {
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  declineButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  declineButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
});

export default TermsOfUseModal;
