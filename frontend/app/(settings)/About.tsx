import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import { getGlobalStyles } from "@/styles/globalStyles";
import useThemeStore from "@/store/useThemeStore";
import TeamMemberCard from "@/components/settings/about/TeamMembersCard";
import { Header } from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import teamMembers from "@/utils/about/teamMembers";
import { useHardwareBack } from "@/hooks/useHardwareBack";

const About: React.FC = () => {
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // Hardware back button handling - ADD this while keeping Header functionality
  useHardwareBack({
    enabled: true,
    fallbackRoute: "/(tabs)/Settings",
    useExistingHeaderLogic: true, // Use same logic as Header component
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={dynamicStyles.container}>
        <StatusBar
          backgroundColor={activeTheme.backgroundColor}
          barStyle="light-content"
        />
        <Header title="About Us" />

        <View>
          {teamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              name={member.name}
              role={member.role}
              bio={member.bio}
              image={member.image}
              socialLinks={member.socialLinks}
            />
          ))}
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            <Text style={{ fontFamily: "Poppins-SemiBold" }}>WikaTalk</Text>: A
            Mobile-Based Filipino Dialect Interpreter with Gamified Features
            using Natural Language Processing (NLP).
          </Text>
          <Text style={styles.descriptionText}>
            This application was developed as part of our undergraduate thesis
            in fulfillment of the requirements for the degree of Bachelor of
            Science in Computer Science at City College of Calamba, Academic
            Year 2025–2026.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;

const styles = StyleSheet.create({
  descriptionSection: {
    padding: 12,
    marginBottom: 32,
  },
  descriptionText: {
    marginBottom: 4,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "white",
    lineHeight: 20,
  },
});
