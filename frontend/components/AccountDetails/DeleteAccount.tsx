import React, { useState, useEffect } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/AccountDetails/Button";
import FormInput from "@/components/FormInput";
import { AlertCircle, AlertTriangle, KeyRound, X } from "lucide-react-native";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import ConfirmationModal from "@/components/ConfirmationModal";

// Define validation schema
const verificationCodeSchema = yup.object({
  verificationCode: yup
    .string()
    .required("Verification code is required")
    .matches(/^[0-9]{6}$/, "Must be exactly 6 digits"),
});

const DeleteAccount = () => {
  const { activeTheme } = useThemeStore();
  const { requestAccountDeletion, verifyDeletionCode, deleteAccount } =
    useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [deletionToken, setDeletionToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Setup form control for verification code
  const {
    control: verificationControl,
    handleSubmit: handleVerificationSubmit,
    formState: { errors: verificationErrors },
    reset: resetVerificationForm,
  } = useForm({
    resolver: yupResolver(verificationCodeSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  // Timer for code expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown]);
  const [requestCooldown, setRequestCooldown] = useState(0);

  // Add new effect for request cooldown

  useEffect(() => {
    if (requestCooldown > 0) {
      const timer = setTimeout(
        () => setRequestCooldown(requestCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [requestCooldown]);

  const handleOpenModal = () => {
    setIsModalVisible(true);
    setStep(1);
    setError("");
  };

  // Instead of closing directly, show confirmation dialog
  const handleAttemptClose = () => {
    // Only show confirmation if process has been started (beyond step 1)
    if (step > 1) {
      setConfirmModalVisible(true);
    } else {
      handleCloseModal();
    }
  };

  // Close everything
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setConfirmModalVisible(false);
    setError("");
    resetVerificationForm();
    setDeletionToken("");
  };

  // Continue deletion process (when user cancels the confirmation modal)
  const handleContinueDeletion = () => {
    setConfirmModalVisible(false);
  };

  const handleRequestCode = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await requestAccountDeletion();

      if (result.success) {
        setStep(2);

        setCountdown(300); // 5 minutes countdown

        setCanResend(false);
      } else {
        // Handle rate limiting specifically

        if (result.isRateLimited) {
          setError(`${result.message}`); // Start a countdown for the cooldown period
          if (result.remainingTime) {
            // Start countdown for remaining time
            setRequestCooldown(result.remainingTime);
          }
        } else {
          setError(result.message || "Failed to send verification code");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Updated to use form submission
  const handleVerifyCode = async (data: { verificationCode: string }) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await verifyDeletionCode(data.verificationCode);

      if (result.success) {
        setDeletionToken(result.deletionToken || "");
        setStep(3);
      } else {
        setError(result.message || "Failed to verify code");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletionToken) {
      setError("Missing deletion token, please try again");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await deleteAccount(deletionToken);

      if (result.success) {
        handleCloseModal();
      } else {
        setError(result.message || "Failed to delete account");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await requestAccountDeletion();

      if (result.success) {
        setCountdown(300); // 5 minutes countdown
        setCanResend(false);
      } else {
        setError(result.message || "Failed to resend verification code");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: // Request verification code
        return (
          <>
            <View style={styles.warningContainer}>
              <AlertTriangle width={24} height={24} color="#FF9500" />
              <Text
                style={[styles.warningText, { color: BASE_COLORS.darkText }]}
              >
                This action is irreversible. All your data will be permanently
                deleted.
              </Text>
            </View>

            <Text style={[styles.description, { color: BASE_COLORS.darkText }]}>
              To delete your account, we'll send a verification code to your
              email address.
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title={
                  requestCooldown > 0
                    ? `Wait (${requestCooldown}s)`
                    : "Request Verification Code"
                }
                height={40}
                onPress={handleRequestCode}
                isLoading={isLoading}
                disabled={requestCooldown > 0}
                color={TITLE_COLORS.customRed}
              />
            </View>
          </>
        );

      case 2: // Enter verification code
        return (
          <>
            <Text style={[styles.description, { color: BASE_COLORS.darkText }]}>
              Please enter the 6-digit verification code sent to your email:
            </Text>

            {/* FormInput for verification code */}
            <FormInput
              control={verificationControl}
              name="verificationCode"
              placeholder="Enter verification code"
              IconComponent={KeyRound}
              error={verificationErrors.verificationCode?.message}
              keyboardType="number-pad"
              maxLength={6}
            />

            {countdown > 0 ? (
              <Text style={styles.countdown}>
                Code expires in: {Math.floor(countdown / 60)}:
                {(countdown % 60).toString().padStart(2, "0")}
              </Text>
            ) : (
              <Text style={styles.expired}>Code expired</Text>
            )}

            {/* Verify button */}
            <Button
              title="Verify"
              height={40}
              onPress={handleVerificationSubmit(handleVerifyCode)}
              isLoading={isLoading}
              color={TITLE_COLORS.customRed}
              style={{ marginBottom: 12 }}
            />

            <Button
              title="Resend Code"
              onPress={handleResendCode}
              disabled={!canResend || isLoading}
              textColor={
                canResend ? BASE_COLORS.darkText : BASE_COLORS.placeholderText
              }
            />
          </>
        );

      case 3: // Final confirmation
        return (
          <>
            <View style={styles.warningContainer}>
              <AlertCircle width={24} height={24} color="#FF3B30" />
              <Text style={[styles.dangerText, { color: "#FF3B30" }]}>
                This action cannot be undone
              </Text>
            </View>
            <Text style={[styles.description, { color: BASE_COLORS.darkText }]}>
              By proceeding, your account and all associated data will be
              permanently deleted.
            </Text>
            {/* Delete account button */}
            <Button
              title="Delete Account"
              height={40}
              onPress={handleDeleteAccount}
              isLoading={isLoading}
              color="#FF3B30"
            />
            {/* cancel button */}
            <Button
              title="Cancel"
              height={40}
              textColor={BASE_COLORS.darkText}
              onPress={handleAttemptClose}
              style={{ marginBottom: 12 }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Button
        title="Delete Account"
        onPress={handleOpenModal}
        color={TITLE_COLORS.customRed}
      />

      {/* Main Account Deletion Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleAttemptClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.headerContainer]}>
              <Text style={styles.headerTitle}>Delete Account</Text>

              {/* button to close modal */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleAttemptClose}
              >
                <X width={17} height={17} color="white" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              {error ? (
                <View style={styles.errorContainer}>
                  <AlertCircle width={20} height={20} color={"#FF3B30"} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              {renderStepContent()}
              {step === 1 && (
                <Button
                  title="Cancel"
                  height={40}
                  textColor={activeTheme.secondaryColor}
                  onPress={handleCloseModal}
                  style={{ marginTop: 16 }}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal for canceling delete process */}
      <ConfirmationModal
        visible={confirmModalVisible}
        title="Cancel Account Deletion?"
        text="Are you sure you want to cancel the account deletion process? Any progress will be lost."
        confirmButtonText="Yes, Cancel Deletion"
        onCancel={handleContinueDeletion}
        onConfirm={handleCloseModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TITLE_COLORS.customRed,
    justifyContent: "center",
    position: "relative", // For absolute positioning of close button
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: "white",
  },
  closeButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  description: {
    fontSize: 14,
    margin: 12,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontFamily: "Poppins-Regular",
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
  },
  dangerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  buttonContainer: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 8,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  countdown: {
    textAlign: "center",
    marginBottom: 16,
    color: "#555",
  },
  expired: {
    textAlign: "center",
    marginBottom: 16,
    color: "#FF3B30",
  },
});

export default DeleteAccount;
