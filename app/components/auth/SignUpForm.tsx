import React, { useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { User, Lock, Mail } from "lucide-react-native";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import TermsOfUseModal from "@/components/legal/TermsOfUseModal";

import FormInput from "@/components/FormInput";
import { View } from "react-native";
interface SignUpFormProps {
  control: any;
  errors: any;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ control, errors }) => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <>
      {/* full name */}
      <FormInput
        control={control}
        name="fullName"
        placeholder="Full Name"
        IconComponent={User}
        error={errors.fullName?.message}
        autoCapitalize="words"
      />

      {/* username */}
      <FormInput
        control={control}
        name="username"
        placeholder="Username"
        IconComponent={User}
        error={errors.username?.message}
      />

      {/* Provide a valid email text */}
      <Text style={[styles.helpText, { color: BASE_COLORS.placeholderText }]}>
        Provide a{" "}
        <Text style={[styles.helpTextBold, { color: BASE_COLORS.blue }]}>
          valid email
        </Text>{" "}
        to receive a 6-digit code. Check spam/junk if not received.
      </Text>

      {/* Email address */}
      <FormInput
        control={control}
        name="email"
        placeholder="Email"
        keyboardType="email-address"
        IconComponent={Mail}
        error={errors.email?.message}
        autoCapitalize="none"
      />

      {/* Password */}
      <FormInput
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry
        IconComponent={Lock}
        error={errors.password?.message}
      />

      {/* Confirm password */}
      <FormInput
        control={control}
        name="confirmPassword"
        placeholder="Confirm Password"
        secureTextEntry
        IconComponent={Lock}
        error={errors.confirmPassword?.message}
      />

      {/* Terms of Use Agreement */}
      <View style={styles.termsTextContainer}>
        <Text style={styles.termsText}>By registering, you accept our </Text>
        <TouchableOpacity
          onPress={() => setShowTermsModal(true)}
          style={styles.termsLinkContainer}
        >
          <Text style={styles.termsLink}>Terms of Use</Text>
        </TouchableOpacity>
      </View>

      {/* Terms Modal */}
      <TermsOfUseModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  helpText: {
    padding: 2,
    fontFamily: POPPINS_FONT.regular,
    marginBottom: 4,
    fontSize: COMPONENT_FONT_SIZES.card.description,
    textAlign: "center",
    color: BASE_COLORS.placeholderText,
  },
  helpTextBold: {
    fontFamily: POPPINS_FONT.medium,
  },
  // term of use styles
  termsTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  termsText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
    textAlign: "center",
    lineHeight: 16,
  },
  termsLinkContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 1,
  },
  termsLink: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.blue,
    textDecorationLine: "underline",
  },
});

export default SignUpForm;
