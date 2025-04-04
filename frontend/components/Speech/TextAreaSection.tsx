import React from "react";
import { View, ScrollView, StyleSheet, TextInput } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import useLanguageStore from "@/store/useLanguageStore";

interface TextAreaSectionProps {
  textField: string;
  colors: any;
  position: "top" | "bottom";
}

const TextAreaSection: React.FC<TextAreaSectionProps> = ({
  textField,
  colors: COLORS,
  position,
}) => {
  const { setUpperText, setBottomText } = useLanguageStore();

  const handleTextChange = (text: string) => {
    if (position === "top") {
      setUpperText(text);
    } else {
      setBottomText(text);
    }
  };

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
          editable={true}
          style={[styles.textField, { color: COLORS.text }]}
          placeholder={
            "Tap the microphone icon to begin recording. Tap again to stop."
          }
          placeholderTextColor={COLORS.placeholder}
          onChangeText={handleTextChange}
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
