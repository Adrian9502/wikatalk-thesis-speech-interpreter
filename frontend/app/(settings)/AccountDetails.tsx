import React, { useEffect } from "react";
import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// styles and hooks
import { useAuth } from "@/context/AuthContext";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { useHardwareBack } from "@/hooks/useHardwareBack";

// components
import DotsLoader from "@/components/DotLoader";
import ProfileCard from "@/components/settings/ProfileCard";
import { InfoSection } from "@/components/accountDetails/InfoSection";
import EditProfileSection from "@/components/accountDetails/EditProfileSection";
import { DangerSection } from "@/components/accountDetails/DangerSection";
import { Header } from "@/components/Header";

// styles
import styles from "@/styles/accountDetailsStyles";

const AccountDetails = () => {
  const { activeTheme } = useThemeStore();
  const { userData, getUserProfile } = useAuth();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  const refreshUserData = () => {
    getUserProfile();
  };
  useEffect(() => {
    getUserProfile();
  }, []);

  // Hardware back button handling - ADD this while keeping Header functionality
  useHardwareBack({
    enabled: true,
    fallbackRoute: "/(tabs)/Settings",
    useExistingHeaderLogic: true, // Use same logic as Header component
  });

  if (!userData) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <Header title="Account Details" />
        <View style={styles.loadingContainer}>
          <DotsLoader />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        dynamicStyles.container,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar style="light" />

      {/* Header */}
      <Header title="Account Details" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard
          userData={userData}
          themeColor={activeTheme.secondaryColor}
        />

        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InfoSection userData={userData} theme={activeTheme} />

        <Text style={styles.sectionTitle}>Account Settings</Text>
        <EditProfileSection
          theme={activeTheme}
          onProfileUpdate={refreshUserData}
        />

        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <DangerSection />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountDetails;
