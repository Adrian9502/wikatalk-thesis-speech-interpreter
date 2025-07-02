import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import CoinsDisplay from "@/components/games/rewards/CoinsDisplay";

interface DashboardHeaderProps {
  onCoinsPress: () => void;
}

const DashboardHeader = React.memo(({ onCoinsPress }: DashboardHeaderProps) => {
  return (
    <Animatable.View
      animation="fadeInDown"
      duration={1000}
      style={styles.headerSection}
      useNativeDriver
    >
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.mainTitle}>Game Challenges</Text>
        <Text style={styles.subtitle}>
          Choose your adventure and level up your skills
        </Text>
      </View>
      <Animatable.View 
        animation="bounceIn" 
        delay={500}
        useNativeDriver
      >
        <CoinsDisplay onPress={onCoinsPress} />
      </Animatable.View>
    </Animatable.View>
  );
});

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 30,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.8,
    marginBottom: 2,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
    lineHeight: 20,
  },
});

DashboardHeader.displayName = 'DashboardHeader';
export default DashboardHeader;