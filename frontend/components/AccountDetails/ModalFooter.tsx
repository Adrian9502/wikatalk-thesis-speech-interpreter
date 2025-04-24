import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "@/styles/editProfileStyles";

interface ModalFooterProps {
  onSave: () => void;
  onClose: () => void;
  isLoading: boolean;
  theme: any;
}

export const ModalFooter = ({
  onSave,
  onClose,
  isLoading,
  theme,
}: ModalFooterProps) => (
  <>
    <TouchableOpacity
      style={[styles.saveButton, { backgroundColor: theme.secondaryColor }]}
      onPress={onSave}
      disabled={isLoading}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="white"
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </View>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.cancelButton}
      onPress={onClose}
      disabled={isLoading}
    >
      <Text style={[styles.cancelButtonText, { color: theme.secondaryColor }]}>
        Cancel
      </Text>
    </TouchableOpacity>
  </>
);
