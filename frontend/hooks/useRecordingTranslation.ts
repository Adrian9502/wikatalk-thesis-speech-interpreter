import { useState } from "react";
import axios from "axios";
import * as Speech from "expo-speech";

export const useRecordingTranslation = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const translateAudio = async (
    uri: string | undefined,
    srcLang: string,
    tgtLang: string
  ) => {
    const FILEUPLOAD_URL = process.env.EXPO_PUBLIC_NGROK_FILEUPLOAD_URL;

    if (!FILEUPLOAD_URL || !uri) {
      console.error("No file upload URL or recording URI found");
      return null;
    }

    const formData = new FormData();
    const filetype = uri.split(".").pop();
    const filename = uri.split("/").pop();

    setLoading(true);

    formData.append("file", {
      uri: uri,
      type: `audio/${filetype}`,
      name: filename || `audio.${filetype}`, // Provide a fallback filename
    } as any);
    formData.append("tgtLang", tgtLang);
    formData.append("srcLang", srcLang);

    try {
      const response = await axios.post(FILEUPLOAD_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setLoading(false);
      return {
        translatedText: response?.data["translated_text"],
        transcribedText: response?.data["transcribed_text"],
      };
    } catch (error) {
      console.log("Error translating record: ", error);
      setLoading(false);
      return null;
    }
  };

  const speakText = (text: string, language: string = "fil-PH") => {
    Speech.speak(text, { language: language, rate: 0.75 });
  };

  return {
    loading,
    translateAudio,
    speakText,
  };
};
