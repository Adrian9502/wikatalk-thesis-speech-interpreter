import React from "react";
import { View, Text } from "react-native";
import { Control } from "react-hook-form";
import FormInput from "@/components/FormInput";
import { Feather } from "@expo/vector-icons";
import styles from "@/styles/editProfileStyles";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import { BASE_COLORS } from "@/constant/colors";

// Memoize icon components to prevent recreation
const UserIcon = React.memo((props: any) => <Feather name="user" {...props} />);

interface BasicInfoFormProps {
  control: Control<any>;
  errors: any;
}

export const BasicInfoForm = React.memo(
  ({ control, errors }: BasicInfoFormProps) => {
    const inputLabelStyle = {
      fontSize: COMPONENT_FONT_SIZES.input.label,
      fontFamily: POPPINS_FONT.medium,
      color: BASE_COLORS.darkText,
      marginBottom: 5,
    };

    return (
      <View>
        <Text style={inputLabelStyle}>Full Name</Text>
        <FormInput
          placeholder="Enter your full name"
          control={control}
          name="fullName"
          IconComponent={UserIcon}
          error={errors.fullName?.message}
          autoCapitalize="words"
        />

        <Text style={inputLabelStyle}>Username</Text>
        <FormInput
          placeholder="Enter your username"
          control={control}
          name="username"
          IconComponent={UserIcon}
          error={errors.username?.message}
          autoCapitalize="none"
        />
      </View>
    );
  }
);

BasicInfoForm.displayName = "BasicInfoForm";
