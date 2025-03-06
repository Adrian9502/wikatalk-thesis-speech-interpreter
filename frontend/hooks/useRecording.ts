import { useState } from "react";
import { Audio } from "expo-av";

export const useRecording = () => {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(
    undefined
  );

  const [permissionResponse, requestPermission] = Audio.usePermissions();

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
      return recording;
    } catch (err) {
      console.error("Failed to start recording", err);
      return undefined;
    }
  }

  async function stopRecording() {
    if (!recording) return null;

    console.log("Stopping recording..");
    const tempRecording = recording;
    setRecording(undefined);
    await tempRecording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = tempRecording.getURI();
    console.log("Recording stopped and stored at", uri);
    return uri;
  }

  return {
    recording,

    startRecording,
    stopRecording,
    hasPermission: permissionResponse?.status === "granted",
  };
};
