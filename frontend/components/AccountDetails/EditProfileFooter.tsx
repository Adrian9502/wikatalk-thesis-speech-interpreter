import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "@/styles/editProfileStyles";
import { BASE_COLORS } from "@/constant/colors";

interface ModalFooterProps {
  onSave: () => void;
  onClose: () => void;
  isLoading: boolean;
  theme: any;
}

// Memoize the loading indicator
const LoadingIndicator = React.memo(() => (
  <ActivityIndicator
    size="small"
    color={BASE_COLORS.white}
    style={{ marginRight: 8 }}
  />
));

// Memoize the button content components
const SaveButtonContent = React.memo(
  ({ isLoading }: { isLoading: boolean }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isLoading && <LoadingIndicator />}
      <Text style={styles.saveButtonText}>Save Changes</Text>
    </View>
  )
);

const CancelButtonText = React.memo(({ color }: { color: string }) => (
  <Text style={[styles.cancelButtonText, { color }]}>Cancel</Text>
));

const EditProfileFooter = React.memo(
  ({ onSave, onClose, isLoading, theme }: ModalFooterProps) => {
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
          <SaveButtonContent isLoading={isLoading} />
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
