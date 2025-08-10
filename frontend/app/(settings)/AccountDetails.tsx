import React, { useEffect } from "react";
import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "@/context/AuthContext";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import DotsLoader from "@/components/DotLoader";
import { useHardwareBack } from "@/hooks/useHardwareBack";

import { ProfileCard } from "@/components/accountDetails/ProfileCard";
import { InfoSection } from "@/components/accountDetails/InfoSection";
import { SettingsSection } from "@/components/accountDetails/SettingsSection";
import { DangerSection } from "@/components/accountDetails/DangerSection";
import { Header } from "@/components/Header";
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

      {/* Header - KEEP existing functionality */}
      <Header title="Account Details" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard userData={userData} theme={activeTheme} />

        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InfoSection userData={userData} theme={activeTheme} />

        <Text style={styles.sectionTitle}>Account Settings</Text>
        <SettingsSection
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
