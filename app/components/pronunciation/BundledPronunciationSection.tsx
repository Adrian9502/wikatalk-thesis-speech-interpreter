import React, { useState, useCallback } from "react";
import { View, Text } from "react-native";
import { Audio } from "expo-av";
import BundledPronunciationCard from "@/components/pronunciation/BundledPronunciationCard";
import { BUNDLED_PRONUNCIATION_DATA } from "@/constants/bundledPronunciationData";
import { PRONUNCIATION_ASSETS } from "@/constants/bundledPronunciationData";
import { BASE_COLORS } from "@/constants/colors";
import { POPPINS_FONT, FONT_SIZES } from "@/constants/fontSizes";

interface BundledPronunciationsSectionProps {
  language: string;
}

const BundledPronunciationsSection: React.FC<
  BundledPronunciationsSectionProps
> = ({ language }) => {
  const langKey = (language || "").toLowerCase();
  const bundledData =
    BUNDLED_PRONUNCIATION_DATA[
      langKey as keyof typeof BUNDLED_PRONUNCIATION_DATA
    ] || [];
  const bundledAssets = PRONUNCIATION_ASSETS[langKey] || [];

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound]);

  const playBundledAudio = useCallback(
    async (assetIndex: number) => {
      try {
        // Stop any current audio
        if (sound) {
          await sound.stopAsync().catch(() => {});
          await sound.unloadAsync().catch(() => {});
          setSound(null);
        }

        // Find the corresponding asset
        const asset = bundledAssets[assetIndex];
        if (!asset) {
          console.error(
            `[BundledSection] Asset not found at index ${assetIndex}`
          );
          return;
        }

        setLoadingIndex(assetIndex);
        const { sound: newSound } = await Audio.Sound.createAsync(asset.asset, {
          shouldPlay: true,
        });

        setSound(newSound);
        setPlayingIndex(assetIndex);
        setLoadingIndex(null);

        // Handle playback completion
        newSound.setOnPlaybackStatusUpdate((status: any) => {
          if (!status) return;
          if (status.didJustFinish) {
            setPlayingIndex(null);
            newSound.unloadAsync().catch(() => {});
            setSound(null);
          }
        });
      } catch (error) {
        console.error("[BundledSection] Error playing audio:", error);
        setLoadingIndex(null);
        setPlayingIndex(null);
      }
    },
    [sound, bundledAssets]
  );

  // Don't render if no bundled data for this language
  if (bundledData.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 8 }}>
      {/* Language Header Divider */}
      {/* <View
        style={{
          marginBottom: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
        accessible={false}
      >
        <View
          style={{
            height: 1,
            width: "100%",
            backgroundColor: "#E5E7EB",
            marginBottom: 10,
          }}
        />
        <Text
          style={{
            fontSize: 16,
            fontFamily: POPPINS_FONT.bold,
            color: BASE_COLORS.darkText,
            marginBottom: 10,
            textTransform: "capitalize",
          }}
        >
          {language}
        </Text>
        
      </View> */}

      {/* Bundled Cards */}
      {bundledData.map((item, idx) => (
        <View key={`bundled-${langKey}-${idx}`} style={{ marginBottom: 12 }}>
          <BundledPronunciationCard
            item={item}
            index={idx}
            language={langKey}
            isPlaying={playingIndex === idx}
            isLoading={loadingIndex === idx}
            onPlay={() => playBundledAudio(idx)}
          />
        </View>
      ))}
      <View style={{ height: 1, width: "100%", backgroundColor: "#E5E7EB" }} />
    </View>
  );
};

export default BundledPronunciationsSection;
