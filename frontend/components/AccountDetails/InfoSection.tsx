import React from "react";
import { View } from "react-native";
import { User, Mail, Calendar, Shield } from "react-native-feather";
import { formatDate } from "@/utils/formatDate";
import { UserDataTypes } from "@/types/types";
import { InfoItem } from "@/components/accountDetails/InfoItem";
import styles from "@/styles/accountDetailsStyles";

type InfoSectionProps = {
  userData: UserDataTypes;
  theme: any;
};

export const InfoSection = ({ userData, theme }: InfoSectionProps) => (
  <View style={styles.card}>
    <InfoItem
      icon={<User width={18} height={18} color={theme.secondaryColor} />}
      label="Username"
      value={userData.username}
      theme={theme}
    />
    <InfoItem
      icon={<Mail width={18} height={18} color={theme.secondaryColor} />}
      label="Email"
      value={userData.email}
      theme={theme}
      showDivider
    />
    <InfoItem
      icon={<Calendar width={18} height={18} color={theme.secondaryColor} />}
      label="Account created at"
      value={formatDate(userData.createdAt as string)}
      theme={theme}
      showDivider
    />
    <InfoItem
      icon={<Shield width={18} height={18} color={theme.secondaryColor} />}
      label="Verification Status"
      value={userData.isVerified ? "Verified" : "Not Verified"}
      theme={theme}
      isLast
    />
  </View>
);
