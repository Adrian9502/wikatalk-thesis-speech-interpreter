import React from "react";
import { router } from "expo-router";
import HomePage from "@/components/home/HomePage";

const HomeTab: React.FC = () => {
  const handleNavigateToTab = (tabName: string) => {
    console.log("Home Tab: Navigating to tab:", tabName);

    // Navigate to the appropriate tab
    switch (tabName) {
      case "Speech":
        router.push("/(tabs)/Speech");
        break;
      case "Translate":
        router.push("/(tabs)/Translate");
        break;
      case "Scan":
        router.push("/(tabs)/Scan");
        break;
      case "Games":
        router.push("/(tabs)/Games");
        break;
      case "Pronounce":
        router.push("/(tabs)/Pronounce");
        break;
      case "Settings":
        router.push("/(settings)/Settings");
        break;
      default:
        router.push("/(tabs)/Speech");
    }
  };

  return <HomePage onNavigateToTab={handleNavigateToTab} />;
};

export default HomeTab;
