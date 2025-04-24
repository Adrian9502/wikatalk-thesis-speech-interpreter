import React from "react";
import { View, Text, Switch } from "react-native";
import { Control } from "react-hook-form";
import FormInput from "@/components/FormInput";
import { Feather } from "@expo/vector-icons";
import styles from "@/styles/editProfileStyles";

const LockIcon = (props: any) => <Feather name="lock" {...props} />;

interface PasswordSectionProps {
  control: Control<any>;
  errors: any;
  changePassword: boolean;
  passwordError: string;
  togglePasswordChange: () => void;
  theme: any;
}

export const PasswordSection = ({
  control,
  errors,
  changePassword,
  passwordError,
  togglePasswordChange,
  theme,
}: PasswordSectionProps) => (
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

        <Text style={styles.inputLabel}>Current Password</Text>
        <FormInput
          placeholder="Enter current password"
          control={control}
          name="currentPassword"
          IconComponent={LockIcon}
          secureTextEntry={true}
          error={errors.currentPassword?.message}
        />

        <Text style={styles.inputLabel}>New Password</Text>
        <FormInput
          placeholder="Enter new password"
          control={control}
          name="newPassword"
          IconComponent={LockIcon}
          secureTextEntry={true}
          error={errors.newPassword?.message}
        />

        <Text style={styles.inputLabel}>Confirm Password</Text>
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
