import React, { useEffect } from "react";
import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@/context/AuthContext";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import DotsLoader from "@/components/DotLoader";

import { ProfileCard } from "@/components/AccountDetails/ProfileCard";
import { InfoSection } from "@/components/AccountDetails/InfoSection";
import { SettingsSection } from "@/components/AccountDetails/SettingsSection";
import { DangerSection } from "@/components/AccountDetails/DangerSection";
import { Header } from "@/components/AccountDetails/Header";
import styles from "@/styles/accountDetailsStyles";

const AccountDetails = () => {
  const { activeTheme } = useThemeStore();
  const navigation = useNavigation();
  const { userData, getUserProfile } = useAuth();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  useEffect(() => {
    getUserProfile();
  }, []);

  if (!userData) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <Header
          title="Account Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <DotsLoader />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Header title="Account Details" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard userData={userData} theme={activeTheme} />

        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InfoSection userData={userData} theme={activeTheme} />

        <Text style={styles.sectionTitle}>Account Settings</Text>
        <SettingsSection theme={activeTheme} />

        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <DangerSection />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountDetails;
