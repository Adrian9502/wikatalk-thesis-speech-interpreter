import { useState, useEffect } from "react";
import { Audio } from "expo-av";

interface RecordingState {
  recording: Audio.Recording | null;
  error: Error | null;
  status: "idle" | "recording" | "error";
  hasPermission: boolean;
  recordingDuration: number;
  startTime: number | null;
}

export const useRecording = () => {
  const [state, setState] = useState<RecordingState>({
    recording: null,
    error: null,
    status: "idle",
    hasPermission: false,
    recordingDuration: 0,
    startTime: null,
  });

  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // NEW: Duration tracking effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.recording && state.startTime) {
      interval = setInterval(() => {
        const currentDuration = (Date.now() - state.startTime!) / 1000;
        setState((prev) => ({
          ...prev,
          recordingDuration: currentDuration,
        }));
      }, 100); // Update every 100ms for smooth progress
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.recording, state.startTime]);

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

      // NEW: Set start time and reset duration
      const now = Date.now();
      setState({
        recording,
        error: null,
        status: "recording",
        hasPermission: true,
        recordingDuration: 0,
        startTime: now,
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
        recordingDuration: 0,
        startTime: null,
      });
      return null;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    if (!state.recording || !state.startTime) return null;

    try {
      console.log("Stopping recording..");
      const tempRecording = state.recording;
      const finalDuration = (Date.now() - state.startTime) / 1000;

      // IMPORTANT: Always allow stopping, just update the state
      setState({
        recording: null,
        error: null,
        status: "idle",
        hasPermission: permissionResponse?.status === "granted",
        recordingDuration: finalDuration, // Keep the final duration for validation
        startTime: null,
      });

      await tempRecording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = tempRecording.getURI();
      console.log(
        `Recording stopped and stored at ${uri}, duration: ${finalDuration.toFixed(
          2
        )}s`
      );
      return uri;
    } catch (error) {
      console.error("Error stopping recording", error);
      setState({
        recording: null,
        error: error instanceof Error ? error : new Error(String(error)),
        status: "error",
        hasPermission: permissionResponse?.status === "granted",
        recordingDuration: 0,
        startTime: null,
      });
      return null;
    }
  };
  // NEW: Get formatted duration for display
  const getFormattedDuration = (): string => {
    return state.recordingDuration.toFixed(1);
  };

  return {
    recording: state.recording,
    error: state.error,
    status: state.status,
    hasPermission: state.hasPermission,
    recordingDuration: state.recordingDuration,
    startTime: state.startTime,
    startRecording,
    stopRecording,
    getFormattedDuration,
  };
};
