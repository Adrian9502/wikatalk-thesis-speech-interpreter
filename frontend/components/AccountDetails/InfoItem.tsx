import React from "react";
import { View, Text } from "react-native";
import styles from "@/styles/accountDetailsStyles";

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  theme: any;
  showDivider?: boolean;
  isLast?: boolean;
};

export const InfoItem = ({
  icon,
  label,
  value,
  theme,
  showDivider = true,
  isLast = false,
}: InfoItemProps) => (
  <>
    <View style={styles.infoItem}>
      <View
        style={[
          styles.infoIconContainer,
          { backgroundColor: theme.lightColor },
        ]}
      >
        {icon}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Not available"}</Text>
      </View>
    </View>
    {showDivider && !isLast && <View style={styles.divider} />}
  </>
);
