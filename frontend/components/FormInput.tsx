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
}

const FormInput = <T extends FieldValues>({
  placeholder,
  onChangeText,
  value,
  secureTextEntry = false,
  keyboardType = "default",
  IconComponent,
  control,
  name,
  error,
}: FormInputProps<T>) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // clear input value on X button press
  const handleClearInput = () => {
    onChangeText(""); // Clear the input value
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
                  {...(IconComponent as any).defaultProps}
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
                className="flex-1 text-white font-pregular text-lg"
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
              />

              {/* Clear Icon (X) */}
              {value && ( // Only show the clear icon if there is text
                <TouchableOpacity
                  onPress={handleClearInput}
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
