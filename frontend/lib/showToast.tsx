import Toast from "react-native-toast-message";

interface ShowToastData {
  type: "success" | "error" | "info";
  title: string;
  description: string;
}

export const showToast = ({ type, title, description }: ShowToastData) => {
  Toast.show({
    type,
    text1: title,
    text2: description,
    position: "top",
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
    text2Style: { flexWrap: "wrap" },
  });
};
