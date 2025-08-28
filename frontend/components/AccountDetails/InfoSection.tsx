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

// Memoize icon components
const UserIcon = React.memo((props: any) => <User {...props} />);
const MailIcon = React.memo((props: any) => <Mail {...props} />);
const CalendarIcon = React.memo((props: any) => <Calendar {...props} />);
const ShieldIcon = React.memo((props: any) => <Shield {...props} />);

export const InfoSection = React.memo(
  ({ userData, theme }: InfoSectionProps) => {
    // Memoize formatted date to prevent recalculation
    const formattedDate = React.useMemo(
      () => formatDate(userData.createdAt as string),
      [userData.createdAt]
    );

    // Memoize verification status
    const verificationStatus = React.useMemo(
      () => (userData.isVerified ? "Verified" : "Not Verified"),
      [userData.isVerified]
    );

    return (
      <View style={styles.card}>
        <InfoItem
          icon={
            <UserIcon width={16} height={16} color={theme.secondaryColor} />
          }
          label="Name"
          value={userData.fullName || "Not provided"}
          theme={theme}
        />
        <InfoItem
          icon={
            <UserIcon width={16} height={16} color={theme.secondaryColor} />
          }
          label="Username"
          value={userData.username || "Not provided"}
          theme={theme}
        />
        <InfoItem
          icon={
            <MailIcon width={16} height={16} color={theme.secondaryColor} />
          }
          label="Email"
          value={userData.email || "Not provided"}
          theme={theme}
          showDivider
        />
        <InfoItem
          icon={
            <CalendarIcon width={16} height={16} color={theme.secondaryColor} />
          }
          label="Account created at"
          value={formattedDate}
          theme={theme}
          showDivider
        />
        <InfoItem
          icon={
            <ShieldIcon width={16} height={16} color={theme.secondaryColor} />
          }
          label="Verification Status"
          value={verificationStatus}
          theme={theme}
          isLast
        />
      </View>
    );
  }
);

InfoSection.displayName = "InfoSection";
