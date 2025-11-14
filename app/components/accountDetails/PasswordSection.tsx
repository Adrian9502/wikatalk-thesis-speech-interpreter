import React from "react";
import { View, Text, Switch, ActivityIndicator } from "react-native";
import { Control } from "react-hook-form";
import FormInput from "@/components/FormInput";
import { Feather } from "@expo/vector-icons";
import { Check, X, AlertTriangle, Info } from "lucide-react-native";
import styles from "@/styles/editProfileStyles";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constants/colors";

const LockIcon = React.memo((props: any) => <Feather name="lock" {...props} />);

interface PasswordSectionProps {
  control: Control<any>;
  errors: any;
  changePassword: boolean;
  passwordError: string;
  togglePasswordChange: () => void;
  passwordValidation: {
    isPasswordValid: boolean | null;
    isValidating: boolean;
  };
  theme: any;
  isGoogleUser?: boolean;
}

// Memoize the validation icon component
const PasswordValidationIcon = React.memo(
  ({
    isValidating,
    isPasswordValid,
    theme,
    changePassword,
  }: {
    isValidating: boolean;
    isPasswordValid: boolean | null;
    theme: any;
    changePassword: boolean;
  }) => {
    if (!changePassword) return null;

    if (isValidating) {
      return (
        <ActivityIndicator
          size="small"
          color={theme.secondaryColor}
          style={{ marginLeft: 10 }}
        />
      );
    } else if (isPasswordValid === true) {
      return <Check size={14} color="green" style={{ marginLeft: 10 }} />;
    } else if (isPasswordValid === false) {
      return <X size={14} color="red" style={{ marginLeft: 10 }} />;
    }
    return null;
  }
);

// Memoize the Google user info component
const GoogleUserInfo = React.memo(({ theme }: { theme: any }) => {
  const { activeTheme } = useThemeStore();

  return (
    <View
      style={[
        styles.googleUserInfoContainer,
        { borderLeftColor: activeTheme.secondaryColor },
      ]}
    >
      <Text style={[styles.googleUserInfoText, { color: theme.textColor }]}>
        Password management is not available because you signed in with Google.
        Continue using Google Sign-In to access your account.
      </Text>
    </View>
  );
});

export const PasswordSection = React.memo(
  ({
    control,
    errors,
    changePassword,
    passwordError,
    togglePasswordChange,
    passwordValidation,
    theme,
    isGoogleUser = false,
  }: PasswordSectionProps) => {
    const { isPasswordValid, isValidating } = passwordValidation;

    // Early return for Google users to prevent unnecessary renders
    if (isGoogleUser) {
      return <GoogleUserInfo theme={theme} />;
    }

    return (
      <>
        <View style={styles.passwordToggleContainer}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Switch
            trackColor={{ false: "#E5E7EB", true: theme.lightColor }}
            thumbColor={changePassword ? theme.secondaryColor : "#f4f3f4"}
            ios_backgroundColor="#E5E7EB"
            onValueChange={togglePasswordChange}
            value={changePassword}
          />
        </View>

        {changePassword && (
          <View style={styles.passwordSection}>
            {/* Rest of the password change form */}
            {passwordError ? (
              <Text style={styles.passwordErrorText}>{passwordError}</Text>
            ) : null}
            <View style={styles.passwordField}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.validationIconContainer}>
                <PasswordValidationIcon
                  isValidating={isValidating}
                  isPasswordValid={isPasswordValid}
                  theme={theme}
                  changePassword={changePassword}
                />
              </View>
            </View>
            <FormInput
              placeholder="Enter current password"
              control={control}
              name="currentPassword"
              IconComponent={LockIcon}
              secureTextEntry={true}
              error={errors.currentPassword?.message}
            />

            {isPasswordValid === false && (
              <View style={styles.invalidPasswordWarning}>
                <AlertTriangle size={14} color={BASE_COLORS.orange} />
                <Text style={styles.invalidPasswordText}>
                  Current password is incorrect
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>New Password</Text>
            <FormInput
              placeholder="Enter new password"
              control={control}
              name="newPassword"
              IconComponent={LockIcon}
              secureTextEntry={true}
              error={errors.newPassword?.message}
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <FormInput
              placeholder="Confirm new password"
              control={control}
              name="confirmPassword"
              IconComponent={LockIcon}
              secureTextEntry={true}
              error={errors.confirmPassword?.message}
            />
          </View>
        )}
      </>
    );
  }
);

PasswordSection.displayName = "PasswordSection";
