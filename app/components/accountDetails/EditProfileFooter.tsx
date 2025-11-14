import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "@/styles/editProfileStyles";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface ModalFooterProps {
  onSave: () => void;
  onClose: () => void;
  isLoading: boolean;
  theme: any;
  hasImageChanged?: boolean;
}

// Memoize the loading indicator
const LoadingIndicator = React.memo(() => (
  <ActivityIndicator
    size="small"
    color={BASE_COLORS.white}
    style={{ marginRight: 8 }}
  />
));

// Enhanced save button content with better messaging
const SaveButtonContent = React.memo(
  ({
    isLoading,
    hasImageChanged,
  }: {
    isLoading: boolean;
    hasImageChanged?: boolean;
  }) => {
    const buttonText = React.useMemo(() => {
      if (!isLoading) return "Save Changes";
      return hasImageChanged ? "Uploading..." : "Saving...";
    }, [isLoading, hasImageChanged]);

    const textStyle = {
      fontSize: COMPONENT_FONT_SIZES.button.medium,
      fontFamily: POPPINS_FONT.medium,
      color: BASE_COLORS.white,
    };

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading && <LoadingIndicator />}
        <Text style={textStyle}>{buttonText}</Text>
      </View>
    );
  }
);

const CancelButtonText = React.memo(({ color }: { color: string }) => {
  const textStyle = {
    fontSize: COMPONENT_FONT_SIZES.button.small,
    fontFamily: POPPINS_FONT.medium,
    color: color,
  };

  return <Text style={textStyle}>Cancel</Text>;
});

const EditProfileFooter = React.memo(
  ({
    onSave,
    onClose,
    isLoading,
    theme,
    hasImageChanged,
  }: ModalFooterProps) => {
    return (
      <>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.secondaryColor }]}
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
