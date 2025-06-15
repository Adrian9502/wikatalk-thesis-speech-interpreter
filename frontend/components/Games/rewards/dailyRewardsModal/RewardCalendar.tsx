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

  // Generate rewards data only once per month/year/history change
  const rewards = useMemo(() => {
    const today = new Date();
    const todayFormatted = formatDateForComparison(today);
    const rewards: RewardDay[] = [];

    // Extract month and generate days
    const month = today.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    // Prepare claimed dates map for quick lookup
    const claimedDatesMap: Record<string, boolean> = {};
    if (dailyRewardsHistory?.claimedDates) {
      dailyRewardsHistory.claimedDates.forEach((claimed: any) => {
        const date = claimed.date.split("T")[0];
        claimedDatesMap[date] = true;
      });
    }

    // Generate data for each day in the month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
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

    return rewards;
  }, [year, dailyRewardsHistory]);

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
        initialNumToRender={10}
      >
        {rewards.map((item, index) => (
          <RewardDayItem key={`day-${item.day}`} item={item} />
        ))}
      </ScrollView>
    </>
  );
};

export default React.memo(RewardCalendar);
