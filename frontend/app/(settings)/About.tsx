import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import { getGlobalStyles } from "@/styles/globalStyles";
import useThemeStore from "@/store/useThemeStore";
import TeamMemberCard from "@/components/Settings/About/TeamMembersCard";
import { Header } from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import teamMembers from "@/utils/About/teamMembers";
const About: React.FC = () => {
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

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
            WikaTalk: A Mobile-Based Filipino Dialect Interpreter with Gamified
            Features Using Natural Language Processing (NLP). This project was
            developed as a requirement for the completion of our Bachelor's
            degree in Computer Science at City College of Calamba for the
            Academic Year 2025–2026.
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
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "white",
    lineHeight: 24,
  },
});
