import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "@/styles/editProfileStyles";
import { BASE_COLORS } from "@/constant/colors";

interface ModalFooterProps {
  onSave: () => void;
  onClose: () => void;
  isLoading: boolean;
  theme: any;
  hasImageChanged?: boolean; // NEW: Add prop to indicate if image was changed
}

// Memoize the loading indicator
const LoadingIndicator = React.memo(() => (
  <ActivityIndicator
    size="small"
    color={BASE_COLORS.white}
    style={{ marginRight: 8 }}
  />
));

// NEW: Enhanced save button content with better messaging
const SaveButtonContent = React.memo(
  ({
    isLoading,
    hasImageChanged,
  }: {
    isLoading: boolean;
    hasImageChanged?: boolean;
  }) => {
    // Show different text based on whether image is being uploaded
    const buttonText = React.useMemo(() => {
      if (!isLoading) return "Save Changes";
      return hasImageChanged ? "Uploading..." : "Saving...";
    }, [isLoading, hasImageChanged]);

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading && <LoadingIndicator />}
        <Text style={styles.saveButtonText}>{buttonText}</Text>
      </View>
    );
  }
);

const CancelButtonText = React.memo(({ color }: { color: string }) => (
  <Text style={[styles.cancelButtonText, { color }]}>Cancel</Text>
));

const EditProfileFooter = React.memo(
  ({
    onSave,
    onClose,
    isLoading,
    theme,
    hasImageChanged = false, // NEW: Default value
  }: ModalFooterProps) => {
    // Memoize style objects
    const saveButtonStyle = React.useMemo(
      () => [styles.saveButton, { backgroundColor: theme.secondaryColor }],
      [theme.secondaryColor, styles.saveButton]
    );

    return (
      <>
        <TouchableOpacity
          style={saveButtonStyle}
          onPress={onSave}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <SaveButtonContent
            isLoading={isLoading}
            hasImageChanged={hasImageChanged}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <CancelButtonText color={theme.secondaryColor} />
        </TouchableOpacity>
      </>
    );
  }
);

EditProfileFooter.displayName = "EditProfileFooter";
export default EditProfileFooter;
