import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Upload } from "lucide-react-native";
import { BASE_COLORS } from "@/constant/colors";

interface ImageUploadProgressProps {
  visible: boolean;
  theme: any;
}

const ImageUploadProgress = React.memo(
  ({ visible, theme }: ImageUploadProgressProps) => {
    if (!visible) return null;

    return (
      <View style={styles.uploadProgressContainer}>
        <View
          style={[
            styles.uploadProgressContent,
            { borderColor: theme.secondaryColor },
          ]}
        >
          <Upload size={13} color={theme.secondaryColor} />
          <Text
            style={[
              styles.uploadProgressTitle,
              { color: theme.secondaryColor },
            ]}
          >
            Uploading Image
          </Text>
          <ActivityIndicator size="small" color={theme.secondaryColor} />
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  uploadProgressContainer: {
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadProgressContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 111, 229, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  uploadProgressTitle: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
  },
});

ImageUploadProgress.displayName = "ImageUploadProgress";
export default ImageUploadProgress;
