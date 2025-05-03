import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Search, X } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { debouncedSetSearchTerm } from "@/store/usePronunciationStore";

interface SearchBarProps {
  searchInput: string;
  setSearchInput: (text: string) => void;
  setSearchTerm: (term: string) => void;
}

const SearchBar = ({
  searchInput,
  setSearchInput,
  setSearchTerm,
}: SearchBarProps) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search width={20} height={20} color={BASE_COLORS.blue} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search words/phrases"
          placeholderTextColor={BASE_COLORS.placeholderText}
          value={searchInput}
          onChangeText={(text) => {
            setSearchInput(text);
            debouncedSetSearchTerm(text);
          }}
          returnKeyType="search"
        />
        {searchInput !== "" && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchInput("");
              setSearchTerm("");
            }}
          >
            <X width={16} height={16} color={BASE_COLORS.placeholderText} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    marginRight: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.darkText,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;
