import { SafeAreaView } from "react-native";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, TextInput, Card, Text } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
const Translate = () => {
  const [tagalogText, setTagalogText] = useState("");
  const [bisayaText, setBisayaText] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <Text style={styles.header}>WikaTalk</Text>
      <Text style={styles.subHeader}>WikaTranslate</Text>

      {/* Language Selection and TextInput Section */}
      <Card style={styles.card}>
        <View style={styles.inputContainer}>
          {/* Tagalog Input */}
          <TextInput
            label="Tagalog"
            value={tagalogText}
            onChangeText={setTagalogText}
            style={styles.input}
          />
          <Button
            icon="trash-can"
            mode="contained"
            onPress={() => setTagalogText("")}
            style={styles.trashButton}
          />
        </View>

        {/* Translate Button */}
        <MaterialCommunityIcons
          name="microphone"
          size={40}
          color="white"
          style={styles.icon}
        />

        {/* Bisaya Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Bisaya"
            value={bisayaText}
            onChangeText={setBisayaText}
            style={styles.input}
          />
          <Button
            icon="language-c"
            mode="contained"
            onPress={() => setBisayaText("")}
            style={styles.languageButton}
          />
        </View>
      </Card>

      {/* Footer Section */}
      <View style={styles.footer}>
        <MaterialCommunityIcons
          name="volume-high"
          size={30}
          color="white"
          style={styles.footerIcon}
        />
        <Button
          icon="file-document"
          mode="contained"
          onPress={() => {}}
          style={styles.footerButton}
        >
          Save
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default Translate;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00BFAE",
    justifyContent: "flex-start",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  subHeader: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    marginVertical: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    width: "70%",
    backgroundColor: "transparent",
  },
  trashButton: {
    backgroundColor: "#FF2D00",
  },
  languageButton: {
    backgroundColor: "#4CAF50",
  },
  icon: {
    alignSelf: "center",
    marginVertical: 20,
    backgroundColor: "#1E5E65",
    borderRadius: 50,
    padding: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },
  footerIcon: {
    backgroundColor: "#1E5E65",
    borderRadius: 50,
    padding: 10,
  },
  footerButton: {
    backgroundColor: "#FFB800",
    borderRadius: 10,
  },
});
