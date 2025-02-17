import { TextInput, View, TouchableOpacity, Text } from "react-native";
import { LucideIcon, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Control, Controller } from "react-hook-form";

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  IconComponent?: LucideIcon;
  control: Control<any>;
  name: string;
  error?: string;
}

const FormInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  IconComponent,
  control,
  name,
  error,
}: InputFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View className="mb-4">
      <Controller
        control={control}
        name={name}
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
                  style={{ marginRight: 8 }}
                  size={21}
                  color="white"
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

              {secureTextEntry && (
                <TouchableOpacity
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

export default FormInput;
