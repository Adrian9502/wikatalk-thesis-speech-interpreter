import React from "react";
import { View, Text } from "react-native";
import styles from "@/styles/accountDetailsStyles";
import { UserDataTypes } from "@/types/types";

type ProfileCardProps = {
  userData: UserDataTypes;
  theme: any;
};

export const ProfileCard = ({ userData, theme }: ProfileCardProps) => (
  <View style={styles.profileCard}>
    <View
      style={[
        styles.avatarContainer,
        { backgroundColor: theme.secondaryColor },
      ]}
    >
      <Text style={styles.avatarText}>
        {userData?.fullName?.charAt(0) || "?"}
      </Text>
    </View>
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{userData.fullName}</Text>
      <Text style={[styles.userEmail, { color: theme.secondaryColor }]}>
        {userData.email}
      </Text>
    </View>
  </View>
);
