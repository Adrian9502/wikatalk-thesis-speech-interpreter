import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import React from "react";
import { TITLE_COLORS, BASE_COLORS } from "@/constant/colors";
import { AlertTriangle } from "react-native-feather";
interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  text: string;
  confirmButtonText: string;
  onCancel: () => void;
  onConfirm: () => void;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  text,
  confirmButtonText,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalIconContainer}>
            <AlertTriangle
              width={32}
              height={32}
              color={TITLE_COLORS.customRed}
            />
          </View>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{text}</Text>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={onConfirm}
            >
              <Text style={styles.deleteButtonText}>{confirmButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(206, 17, 38, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: TITLE_COLORS.customRed,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: TITLE_COLORS.customWhite,
  },
  deleteButton: {
    backgroundColor: TITLE_COLORS.customRed,
  },
  cancelButtonText: {
    color: TITLE_COLORS.customRed,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  deleteButtonText: {
    color: BASE_COLORS.white,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
});
