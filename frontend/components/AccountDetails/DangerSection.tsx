import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { UserX, ChevronRight } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import styles from "@/styles/accountDetailsStyles";

export const DangerSection = () => (
  <View style={styles.card}>
    <TouchableOpacity style={styles.dangerItem}>
      <View style={[styles.settingIconContainer, styles.dangerIcon]}>
        <UserX width={20} height={20} color={BASE_COLORS.orange} />
      </View>
      <Text style={styles.dangerText}>Delete Account</Text>
      <ChevronRight width={20} height={20} color="#C0C0C8" />
    </TouchableOpacity>
  </View>
);
