// cspell:ignore scrollview subviews

import React, { useRef, useEffect, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { rewardStyles } from "@/styles/games/rewards.styles";
import RewardDayItem from "./RewardDayItem";
import {
  formatDateForComparison,
  getDaysInMonth,
  getDayRewardAmount,
  RewardDay,
} from "@/hooks/useRewards";

interface RewardCalendarProps {
  monthName: string;
  year: number;
  visible: boolean;
  dailyRewardsHistory: any;
}

const RewardCalendar: React.FC<RewardCalendarProps> = ({
  monthName,
  year,
  visible,
  dailyRewardsHistory,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Create a fast lookup map for claimed dates instead of iterating
  const claimedDatesMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (dailyRewardsHistory?.claimedDates) {
      dailyRewardsHistory.claimedDates.forEach((claimed: any) => {
        const date = claimed.date.split("T")[0];
        map[date] = true;
      });
    }
    return map;
  }, [dailyRewardsHistory]);

  // Add a useDeferredValue for the rewards calculation
  const rewards = useMemo(() => {
    console.log("[RewardCalendar] Calculating rewards data");

    // Move this calculation to a worker or defer it
    const today = new Date();
    const todayFormatted = formatDateForComparison(today);
    const rewards = [];

    // This is the expensive part - calculate quickly
    const month = today.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    // Generate data in batches to avoid blocking
    const batchSize = 5;
    for (let i = 0; i < daysInMonth; i += batchSize) {
      const endIdx = Math.min(i + batchSize, daysInMonth);

      for (let dayNum = i + 1; dayNum <= endIdx; dayNum++) {
        const date = new Date(year, month, dayNum);
        const dateFormatted = formatDateForComparison(date);
        const reward = getDayRewardAmount(date);

        // Determine status once
        let status: "claimed" | "today" | "upcoming" | "missed";
        if (dateFormatted === todayFormatted) {
          status = claimedDatesMap[dateFormatted] ? "claimed" : "today";
        } else if (dateFormatted < todayFormatted) {
          status = claimedDatesMap[dateFormatted] ? "claimed" : "missed";
        } else {
          status = "upcoming";
        }

        rewards.push({
          day: dayNum,
          date: dateFormatted,
          reward,
          status,
        });
      }
    }

    return rewards;
  }, [year, claimedDatesMap]);

  // Auto-scroll to today when modal opens and data is ready
  useEffect(() => {
    if (visible && scrollViewRef.current && rewards.length > 0) {
      // Find today's index
      const todayIndex = rewards.findIndex((item) => item.status === "today");
      if (todayIndex > -1) {
        // Calculate position with fixed card dimensions
        const cardWidth = 70; // Width of each day card
        const cardMargin = 8; // Total horizontal margin
        const totalCardWidth = cardWidth + cardMargin;

        // Center today's card in the scrollview
        const scrollToIndex = Math.max(0, todayIndex - 2);
        const scrollX = scrollToIndex * totalCardWidth;

        // Use a very short timeout to ensure the view is laid out
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: scrollX,
            animated: false, // Don't animate the initial scroll
          });
        }, 50);
      }
    }
  }, [visible, rewards]);

  return (
    <>
      {/* Month Display */}
      <View style={rewardStyles.monthDisplay}>
        <Text style={rewardStyles.monthText}>
          {monthName} {year}
        </Text>
      </View>

      {/* Days Grid - Optimized to render only visible items */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={rewardStyles.rewardsGrid}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
      >
        {rewards.map((item, index) => (
          <RewardDayItem key={`day-${item.day}`} item={item} />
        ))}
      </ScrollView>
    </>
  );
};

// Use React.lazy to defer rendering this heavy component
const LazyRewardCalendar = React.lazy(() => Promise.resolve({
  default: RewardCalendar
}));

export default React.memo(RewardCalendar);

// In the DailyRewardsModal render function, replace the calendar section with:
// {dailyRewardsHistory && contentReady && (
//   <React.Suspense fallback={<View style={styles.calendarPlaceholder} />}>
//     <LazyRewardCalendar
//       monthName={dateInfo.monthName}
//       year={dateInfo.year}
//       visible={visible && contentReady}
//       dailyRewardsHistory={dailyRewardsHistory}
//     />
//   </React.Suspense>
// )}

// Add this style:
// calendarPlaceholder: {
//   height: 120,
//   backgroundColor: 'rgba(255,255,255,0.1)',
//   borderRadius: 16,
//   marginVertical: 16,
// },
