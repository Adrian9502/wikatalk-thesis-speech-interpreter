import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import { StyleSheet } from "react-native";
import CloseButton from "../buttons/CloseButton";

interface ResetTimerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  showSuccessMessage: boolean;
  resetMessage: string;
  isResetting: boolean;
  shouldDisableReset: boolean;
  resetCost: number;
  coins: number;
  onSuccessAcknowledge: () => void;
}

const ResetTimerModal: React.FC<ResetTimerModalProps> = ({
  visible,
  onClose,
  onConfirmReset,
  showSuccessMessage,
  resetMessage,
  isResetting,
  shouldDisableReset,
  resetCost,
  coins,
  onSuccessAcknowledge,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={NAVIGATION_COLORS.indigo}
            style={styles.modalContent}
          >
            {showSuccessMessage ? (
              // Success Message View
              <>
                <View style={styles.successHeader}>
                  <Text style={styles.successTitle}>
                    {resetMessage.includes("successfully")
                      ? "Success!"
                      : "Error"}
                  </Text>
                </View>
                <View style={styles.successBody}>
                  <Text style={styles.successText}>{resetMessage}</Text>
                </View>
                <View style={styles.successActions}>
                  <TouchableOpacity
                    style={styles.successButton}
                    onPress={onSuccessAcknowledge}
                  >
                    <Text style={styles.successButtonText}>Got it!</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Reset Confirmation View
              <>
                <CloseButton
                  size={17}
                  onPress={onClose}
                  isResetting={isResetting}
                />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Reset Timer?</Text>
                </View>

                <View style={styles.modalBody}>
                  {shouldDisableReset ? (
                    <Text style={styles.modalText}>
                      {coins < resetCost
                        ? "💰 Insufficient coins for reset. Earn more coins and try again!"
                        : "🌟 Great job! You answered correctly, so timer reset is not available."}
                    </Text>
                  ) : (
                    <>
                      <Text style={styles.modalText}>
                        This will reset your timer to 0:00 and clear your
                        progress for this level.
                      </Text>
                      <View style={styles.costInfo}>
                        <View style={styles.costRow}>
                          <Text style={styles.costLabel}>Cost:</Text>
                          <View style={styles.costValue}>
                            <Image
                              source={require("@/assets/images/coin.png")}
                              style={styles.coinImage}
                            />
                            <Text style={styles.costText}>{resetCost}</Text>
                          </View>
                        </View>
                        <View style={styles.costRow}>
                          <Text style={styles.costLabel}>Your Balance:</Text>
                          <View style={styles.costValue}>
                            <Image
                              source={require("@/assets/images/coin.png")}
                              style={styles.coinImage}
                            />
                            <Text style={styles.costText}>{coins}</Text>
                          </View>
                        </View>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.modalActions}>
                  {!shouldDisableReset ? (
                    <>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                        disabled={isResetting}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.confirmButton,
                          isResetting && styles.confirmButtonDisabled,
                        ]}
                        onPress={onConfirmReset}
                        disabled={isResetting}
                      >
                        {isResetting ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.confirmButtonText}>
                            Reset Timer
                          </Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.confirmButton, { flex: 1 }]}
                      onPress={onClose}
                    >
                      <Text style={styles.confirmButtonText}>Got it!</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </LinearGradient>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 350,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContent: {
    padding: 21,
    position: "relative",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  costInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 16,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  costValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  costText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  coinImage: {
    width: 15,
    height: 15,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#F44336",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "rgba(244, 67, 54, 0.5)",
  },
  confirmButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  successHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  successBody: {
    marginBottom: 24,
  },
  successText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    lineHeight: 24,
  },
  successActions: {
    alignItems: "center",
  },
  successButton: {
    backgroundColor: BASE_COLORS.success,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
  },
  successButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
});

export default ResetTimerModal;
