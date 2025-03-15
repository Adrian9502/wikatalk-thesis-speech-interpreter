import { useState, useEffect } from "react";
import { Audio } from "expo-av";

interface RecordingState {
  recording: Audio.Recording | null;
  error: Error | null;
  status: "idle" | "recording" | "error";
  hasPermission: boolean;
}

export const useRecording = () => {
  const [state, setState] = useState<RecordingState>({
    recording: null,
    error: null,
    status: "idle",
    hasPermission: false,
  });

  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // Check permission on mount
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      hasPermission: permissionResponse?.status === "granted",
    }));
  }, [permissionResponse?.status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.recording) {
        state.recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  const startRecording = async (): Promise<Audio.Recording | null> => {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        const permission = await requestPermission();
        if (permission.status !== "granted") {
          throw new Error("Permission not granted");
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setState({
        recording,
        error: null,
        status: "recording",
        hasPermission: true,
      });

      console.log("Recording started");
      return recording;
    } catch (error) {
      console.error("Failed to start recording", error);
      setState({
        recording: null,
        error: error instanceof Error ? error : new Error(String(error)),
        status: "error",
        hasPermission: permissionResponse?.status === "granted",
      });
      return null;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    if (!state.recording) return null;

    try {
      console.log("Stopping recording..");
      const tempRecording = state.recording;

      setState({
        recording: null,
        error: null,
        status: "idle",
        hasPermission: permissionResponse?.status === "granted",
      });

      await tempRecording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = tempRecording.getURI();
      console.log("Recording stopped and stored at", uri);
      return uri;
    } catch (error) {
      console.error("Error stopping recording", error);
      setState({
        recording: null,
        error: error instanceof Error ? error : new Error(String(error)),
        status: "error",
        hasPermission: permissionResponse?.status === "granted",
      });
      return null;
    }
  };

  return {
    recording: state.recording,
    error: state.error,
    status: state.status,
    hasPermission: state.hasPermission,
    startRecording,
    stopRecording,
  };
};
