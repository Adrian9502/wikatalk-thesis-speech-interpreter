import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Edit2, ChevronRight } from "react-native-feather";
import styles from "@/styles/accountDetailsStyles";

type SettingsSectionProps = {
  theme: any;
};

export const SettingsSection = ({ theme }: SettingsSectionProps) => (
  <View style={styles.card}>
    <TouchableOpacity style={styles.settingItem}>
      <View
        style={[
          styles.settingIconContainer,
          { backgroundColor: theme.lightColor },
        ]}
      >
        <Edit2 width={20} height={20} color={theme.secondaryColor} />
      </View>
      <Text style={styles.settingText}>Edit Profile</Text>
      <ChevronRight width={20} height={20} color="#C0C0C8" />
    </TouchableOpacity>
  </View>
);
