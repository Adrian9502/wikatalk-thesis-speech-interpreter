import React from "react";
import { View, Text } from "react-native";
import { Control } from "react-hook-form";
import FormInput from "@/components/FormInput";
import { Feather } from "@expo/vector-icons";
import styles from "@/styles/editProfileStyles";

// Memoize icon components to prevent recreation
const UserIcon = React.memo((props: any) => <Feather name="user" {...props} />);

interface BasicInfoFormProps {
  control: Control<any>;
  errors: any;
}

export const BasicInfoForm = React.memo(
  ({ control, errors }: BasicInfoFormProps) => {
    return (
      <View>
        <Text style={styles.inputLabel}>Full Name</Text>
        <FormInput
          placeholder="Enter your full name"
          control={control}
          name="fullName"
          IconComponent={UserIcon}
          error={errors.fullName?.message}
          autoCapitalize="words"
        />

        <Text style={styles.inputLabel}>Username</Text>
        <FormInput
          placeholder="Enter your username"
          control={control}
          name="username"
          IconComponent={UserIcon}
          error={errors.username?.message}
        />
      </View>
    );
  }
);

BasicInfoForm.displayName = "BasicInfoForm";
