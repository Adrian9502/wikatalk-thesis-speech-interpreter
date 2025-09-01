import {
  TextInput,
  View,
  TouchableOpacity,
  Text,
  KeyboardTypeOptions,
  StyleSheet,
} from "react-native";
import { LucideIcon, Eye, EyeOff, X } from "lucide-react-native";
import { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import React from "react";

// Generic FormInput component that works with any form type
interface FormInputProps<T extends FieldValues> {
  placeholder: string;
  control: Control<T>;
  name: Path<T>;
  IconComponent: React.ComponentType<any>;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  onChangeText?: (text: string) => void;
  editable?: boolean;
}

const FormInput = <T extends FieldValues>({
  placeholder,
  control,
  name,
  IconComponent,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  maxLength,
  autoCapitalize = "none",
  onChangeText,
  editable = true,
}: FormInputProps<T>) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <>
            <View
              style={[
                styles.inputContainer,
                error ? styles.inputContainerError : null,
              ]}
            >
              {IconComponent && (
                <IconComponent
                  size={16}
                  color="#4A6FFF"
                  style={styles.inputIcon}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#888"
                value={value ?? ""}
                onChangeText={(text) => {
                  onChange(text);
                  if (onChangeText) onChangeText(text);
                }}
                secureTextEntry={!isPasswordVisible && secureTextEntry}
                keyboardType={keyboardType}
                maxLength={maxLength}
                autoCapitalize={autoCapitalize}
                editable={editable}
              />

              {/* Clear Icon (X) */}
              {value && (
                <TouchableOpacity
                  onPress={() => {
                    onChange("");
                    if (onChangeText) onChangeText("");
                  }}
                  style={styles.actionIcon}
                >
                  <X size={14} color="#888" />
                </TouchableOpacity>
              )}

              {/* Toggle Password Visibility Icon */}
              {secureTextEntry && (
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <Eye size={16} color="#888" />
                  ) : (
                    <EyeOff size={16} color="#888" />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {error && (
              <View style={{ marginBottom: 4 }}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            )}
          </>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  inputContainerError: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    fontFamily: "Poppins-Regular",
    flex: 1,
    paddingVertical: 4,
    fontSize: 12,
    color: "#333",
  },
  actionIcon: {
    marginLeft: 5,
    opacity: 0.8,
  },
  errorContainer: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
});

// Memoize the component to prevent unnecessary re-renders
export default React.memo(FormInput) as <T extends FieldValues>(
  props: FormInputProps<T>
) => React.ReactElement;
