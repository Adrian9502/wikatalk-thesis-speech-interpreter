import React from "react";
import { Text } from "react-native";
import { Control } from "react-hook-form";
import FormInput from "@/components/FormInput";
import { Feather } from "@expo/vector-icons";
import styles from "@/styles/editProfileStyles";

const UserIcon = (props: any) => <Feather name="user" {...props} />;
const AtSign = (props: any) => <Feather name="at-sign" {...props} />;

interface BasicInfoFormProps {
  control: Control<any>;
  errors: any;
}

export const BasicInfoForm = ({ control, errors }: BasicInfoFormProps) => (
  <>
    <Text style={styles.inputLabel}>Full Name</Text>
    <FormInput
      placeholder="Enter your full name"
      control={control}
      name="fullName"
      IconComponent={UserIcon}
      autoCapitalize="words"
      error={errors.fullName?.message}
    />

    <Text style={styles.inputLabel}>Username</Text>
    <FormInput
      placeholder="Enter your username"
      control={control}
      name="username"
      IconComponent={AtSign}
      autoCapitalize="none"
      error={errors.username?.message}
    />
  </>
);
