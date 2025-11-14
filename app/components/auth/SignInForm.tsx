import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { User, Lock } from "lucide-react-native";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";
import FormInput from "@/components/FormInput";

interface SignInFormProps {
  control: any;
  errors: Record<string, any>;
  navigateToForgotPassword: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  control,
  errors,
  navigateToForgotPassword,
}) => {
  return (
    <>
      {/* username or email */}
      <FormInput
        control={control}
        name="usernameOrEmail"
        placeholder="Username or Email"
        IconComponent={User}
        error={errors.usernameOrEmail?.message}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* password */}
      <FormInput
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry
        IconComponent={Lock}
        error={errors.password?.message}
      />

      {/* forgot password */}
      <TouchableOpacity
        onPress={navigateToForgotPassword}
        style={styles.forgotPasswordButton}
      >
        <Text style={[styles.forgotPasswordText, { color: BASE_COLORS.blue }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
  },
});

export default SignInForm;
