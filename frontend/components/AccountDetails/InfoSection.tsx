import React from "react";
import { View, StyleSheet } from "react-native";
import { Mail, User, Calendar, Smartphone } from "react-native-feather";
import { InfoItem } from "./InfoItem";
import { BASE_COLORS } from "@/constant/colors";

interface InfoSectionProps {
  userData: any;
  theme: any;
}

export const InfoSection = React.memo(
  ({ userData, theme }: InfoSectionProps) => {
    const infoItems = [
      {
        icon: <User width={16} height={16} color={theme.secondaryColor} />,
        label: "Full Name",
        value: userData?.fullName || "Not provided",
      },
      {
        icon: <User width={16} height={16} color={theme.secondaryColor} />,
        label: "Username",
        value: userData?.username || "Not provided",
      },
      {
        icon: <Mail width={16} height={16} color={theme.secondaryColor} />,
        label: "Email",
        value: userData?.email || "Not provided",
      },
      {
        icon: <Calendar width={16} height={16} color={theme.secondaryColor} />,
        label: "Joined",
        value: userData?.createdAt
          ? new Date(userData.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Not available",
      },
      {
        icon: (
          <Smartphone width={16} height={16} color={theme.secondaryColor} />
        ),
        label: "Login Method",
        value:
          userData?.authProvider === "google"
            ? "Google Account"
            : "Email & Password",
      },
    ];

    return (
      <View style={styles.card}>
        {infoItems.map((item, index) => (
          <InfoItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            theme={theme}
            showDivider={true}
            isLast={index === infoItems.length - 1}
          />
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
});

InfoSection.displayName = "InfoSection";
