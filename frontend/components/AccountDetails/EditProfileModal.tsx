import React from "react";
import { Modal, View, Text, ScrollView } from "react-native";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ProfilePictureSection } from "@/components/accountDetails/ProfilePictureSection";
import { BasicInfoForm } from "@/components/accountDetails/BasicInfoForm";
import { PasswordSection } from "@/components/accountDetails/PasswordSection";
import EditProfileFooter from "@/components/accountDetails/EditProfileFooter";
import styles from "@/styles/editProfileStyles";
import { UserDataTypes } from "@/types/types";
import ImageUploadProgress from "./ImageUploadProgress";

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

const EditProfileModal = React.memo(
  ({ visible, onClose, onSave, userData, theme }: EditProfileModalProps) => {
    const {
      control,
      handleSubmit,
      formState,
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

            <ScrollView
              bounces={false}
              overScrollMode="never"
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              style={styles.formContainer}
            >
              <ProfilePictureSection
                profilePicture={imageState.profilePicture}
                handleSelectImage={handleSelectImage}
                theme={theme}
              />
              <ImageUploadProgress
                visible={isLoading && imageState.imageChanged}
                theme={theme}
              />
              {errorState.error ? (
                <Text style={styles.errorText}>{errorState.error}</Text>
              ) : null}

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

              <EditProfileFooter
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
  }
);

EditProfileModal.displayName = "EditProfileModal";
export default EditProfileModal;
