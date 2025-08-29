import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapPin } from "react-native-feather";
import { CitiesSection as CitiesSectionType } from "@/types/languageInfo";

interface CitiesSectionProps {
  data: CitiesSectionType["data"];
  colors: {
    primary: string;
    text: string;
    cardBg: string;
    border: string;
  };
}

const CitiesSection: React.FC<CitiesSectionProps> = ({ data, colors }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <MapPin
          width={18}
          height={18}
          strokeWidth={2}
          stroke={colors.primary}
        />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Major Cities
        </Text>
      </View>
      <View style={styles.tagsContainer}>
        {data.cities.map((city: string, index: number) => (
          <View
            key={index}
            style={[
              styles.tag,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: colors.text,
                fontFamily: "Poppins-Regular",
                fontSize: 12,
              }}
            >
              {city}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default CitiesSection;
