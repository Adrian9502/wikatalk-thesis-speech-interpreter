import React from "react";
import { Modal, View, Text, ScrollView } from "react-native";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ProfilePictureSection } from "@/components/accountDetails/ProfilePictureSection";
import { BasicInfoForm } from "@/components/accountDetails/BasicInfoForm";
import { PasswordSection } from "@/components/accountDetails/PasswordSection";
import { ModalFooter } from "@/components/accountDetails/ModalFooter";
import styles from "@/styles/editProfileStyles";
import { UserDataTypes } from "@/types/types";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (userData: {
    fullName: string;
    username: string;
    profilePicture?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
  userData: UserDataTypes;
  theme: any;
}

const EditProfileModal = ({
  visible,
  onClose,
  onSave,
  userData,
  theme,
}: EditProfileModalProps) => {
  const {
    control,
    handleSubmit,
    formState,
    profileValues,
    imageState,
    passwordState,
    errorState,
    isLoading,
    handleSelectImage,
    onFormSubmit,
    togglePasswordChange,
    passwordValidation,
  } = useProfileForm({ userData, visible, onSave });

  const isGoogleUser = userData?.authProvider === "google";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.headerContainer,
              { backgroundColor: theme.secondaryColor },
            ]}
          >
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          <ScrollView style={styles.formContainer}>
            {errorState.error ? (
              <Text style={styles.errorText}>{errorState.error}</Text>
            ) : null}

            <ProfilePictureSection
              profilePicture={imageState.profilePicture}
              handleSelectImage={handleSelectImage}
              theme={theme}
            />

            <Text style={styles.sectionTitle}>Basic Information</Text>
            <BasicInfoForm control={control} errors={formState.errors} />

            <PasswordSection
              control={control}
              errors={formState.errors}
              changePassword={passwordState.changePassword}
              passwordError={passwordState.passwordError}
              togglePasswordChange={togglePasswordChange}
              passwordValidation={passwordValidation}
              theme={theme}
              isGoogleUser={isGoogleUser}
            />

            <ModalFooter
              onSave={handleSubmit(onFormSubmit)}
              onClose={onClose}
              isLoading={isLoading}
              theme={theme}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
