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
import { Control, Controller, FieldValues } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  IconComponent: LucideIcon;
  control: Control<T>;
  name: keyof T;
  error?: string;
  secureTextEntry?: boolean;
  activeInput: string;
  setActiveInput: (name: string) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoComplete?: string;
  className?: string;
}

const FormInput = <T extends FieldValues>({
  placeholder,
  onChangeText,
  value: externalValue, // Rename to avoid confusion
  secureTextEntry = false,
  keyboardType = "default",
  IconComponent,
  control,
  name,
  error,
  maxLength,
  autoComplete,
  className,
}: FormInputProps<T>) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // clear input value on X button press
  const handleClearInput = (onChange: (value: string) => void) => {
    onChange(""); // Clear the form control value
    onChangeText(""); // Clear the external value
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name as any}
        render={({ field: { onChange, value } }) => (
          <View>
            <View
              className="flex-row items-center"
              style={{
                borderBottomWidth: 1,
                borderColor: error ? "#EF4444" : "white",
                marginBottom: 6,
              }}
            >
              {IconComponent && (
                <IconComponent
                  size={21}
                  color="white"
                  style={{ marginRight: 8 }}
                />
              )}

              <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  onChangeText(text);
                }}
                secureTextEntry={!isPasswordVisible && secureTextEntry}
                keyboardType={keyboardType}
                className={`flex-1 text-white font-pregular text-lg ${className}`}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                maxLength={maxLength}
                autoComplete={autoComplete as any}
              />

              {/* Clear Icon (X) */}
              {value && (
                <TouchableOpacity
                  onPress={() => handleClearInput(onChange)}
                  style={styles.iconOpacity}
                >
                  <X size={14} color="white" />
                </TouchableOpacity>
              )}

              {/* Toggle Password Visibility Icon */}
              {secureTextEntry && (
                <TouchableOpacity
                  style={styles.iconOpacity}
                  className="ml-2"
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <Eye size={19} color="white" />
                  ) : (
                    <EyeOff size={19} color="white" />
                  )}
                </TouchableOpacity>
              )}
            </View>
            {error && (
              <View
                style={{
                  paddingTop: 2,
                  paddingBottom: 1,
                  paddingLeft: 10,
                  paddingRight: 10,
                  borderRadius: 5,
                }}
                className="bg-white"
              >
                <Text style={{ color: "#EF4444" }} className="font-pregular">
                  {error}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: -4,
  },
  iconOpacity: {
    opacity: 0.8,
  },
});
export default FormInput;
