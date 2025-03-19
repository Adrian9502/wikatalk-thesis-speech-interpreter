import { useState } from "react";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";

interface OCRResponse {
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string[];
  ParsedResults?: Array<{
    ParsedText: string;
    ErrorMessage?: string;
    ErrorDetails?: string;
  }>;
}

interface UseImageProcessingReturn {
  isProcessing: boolean;
  ocrProgress: number;
  processImage: (uri: string) => Promise<string>;
  recognizeText: (uri: string) => Promise<string>;
}

export const useImageProcessing = (): UseImageProcessingReturn => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);

  // Function to process image
  const processImage = async (uri: string): Promise<string> => {
    try {
      // First compression
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileInfo = await FileSystem.getInfoAsync(compressedImage.uri);
      if (!fileInfo.exists || !("size" in fileInfo)) {
        throw new Error("Failed to get file size");
      }

      // Further compress if still too large
      if (fileInfo.size > 900000) {
        const moreCompressed = await ImageManipulator.manipulateAsync(
          compressedImage.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG }
        );
        return moreCompressed.uri;
      }

      return compressedImage.uri;
    } catch (error) {
      console.error("Image processing error:", error);
      return uri;
    }
  };

  // Function to recognize text using OCR.space API
  const recognizeText = async (uri: string): Promise<string> => {
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      const processedUri = await processImage(uri);
      setOcrProgress(0.3);

      const base64Image = await FileSystem.readAsStringAsync(processedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setOcrProgress(0.5);

      const ocrApikey = process.env.EXPO_PUBLIC_OCR_API_KEY;
      if (!ocrApikey) {
        throw new Error("Missing OCR API key in environment variables");
      }

      const formData = new FormData();
      formData.append("apikey", ocrApikey);
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");
      formData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);

      setOcrProgress(0.7);

      const response = await axios<OCRResponse>({
        method: "post",
        url: "https://api.ocr.space/parse/image",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });

      setOcrProgress(1);

      if (response.data.IsErroredOnProcessing) {
        throw new Error(
          response.data.ErrorMessage?.[0] || "Error processing image"
        );
      }

      return response.data.ParsedResults?.[0]?.ParsedText || "";
    } catch (error: any) {
      console.error("OCR error:", error);
      return `Error: ${
        error.message || "Unknown error during text recognition"
      }`;
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  return { isProcessing, ocrProgress, processImage, recognizeText };
};
