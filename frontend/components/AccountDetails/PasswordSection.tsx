import React from "react";
import { View, Text, Switch, ActivityIndicator } from "react-native";
import { Control } from "react-hook-form";
import FormInput from "@/components/FormInput";
import { Feather } from "@expo/vector-icons";
import { Check, X, AlertTriangle } from "lucide-react-native";
import styles from "@/styles/editProfileStyles";

const LockIcon = (props: any) => <Feather name="lock" {...props} />;

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
}

export const PasswordSection = ({
  control,
  errors,
  changePassword,
  passwordError,
  togglePasswordChange,
  passwordValidation,
  theme,
}: PasswordSectionProps) => {
  const { isPasswordValid, isValidating } = passwordValidation;

  const renderPasswordValidationIcon = () => {
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
      return <Check size={18} color="green" style={{ marginLeft: 10 }} />;
    } else if (isPasswordValid === false) {
      return <X size={18} color="red" style={{ marginLeft: 10 }} />;
    }
    return null;
  };

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
          {passwordError ? (
            <Text style={styles.passwordErrorText}>{passwordError}</Text>
          ) : null}

          <View style={styles.passwordField}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.validationIconContainer}>
              {renderPasswordValidationIcon()}
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
              <AlertTriangle size={16} color="#f59e0b" />
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
};
