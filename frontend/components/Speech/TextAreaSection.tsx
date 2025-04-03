import React from "react";
import { View, ScrollView, StyleSheet, TextInput } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

interface TextAreaSectionProps {
  textField: string;
  colors: any;
}

const TextAreaSection: React.FC<TextAreaSectionProps> = ({
  textField,
  colors: COLORS,
}) => {
  return (
    <View style={styles.textAreaWrapper}>
      <ScrollView
        style={[styles.textArea, { borderColor: COLORS.border }]}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TextInput
          value={textField}
          multiline={true}
          editable={false}
          style={[styles.textField, { color: COLORS.text }]}
          placeholder={
            "Tap the microphone icon to begin recording. Tap again to stop."
          }
          placeholderTextColor={COLORS.placeholder}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  textAreaWrapper: {
    flex: 1,
    marginVertical: 8,
  },
  textArea: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  textField: {
    fontFamily: "Poppins-Regular",
    fontSize: 17,
    flex: 1,
    lineHeight: 24,
    textAlignVertical: "top",
  },
});

export default TextAreaSection;
