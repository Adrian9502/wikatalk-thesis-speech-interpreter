import { useState, useEffect } from "react";
import useCoinsStore from "@/store/games/useCoinsStore";

export interface RewardDay {
  day: number;
  date: string;
  reward: number;
  status: "claimed" | "today" | "upcoming" | "missed";
}

// Constants
export const COIN_REWARDS = {
  weekday: 25,
  weekend: 50,
};

/**
 * Format date for comparison in format YYYY-MM-DD
 */
export const formatDateForComparison = (date: Date): string => {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

/**
 * Get reward amount based on day of week (weekend vs weekday)
 */
export const getDayRewardAmount = (date: Date): number => {
  const day = date.getDay();
  return day === 0 || day === 6 ? COIN_REWARDS.weekend : COIN_REWARDS.weekday;
};

/**
 * Get number of days in a month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const useRewards = (visible: boolean) => {
  const [claimAnimation, setClaimAnimation] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [currentMonth] = useState(new Date());

  const {
    coins,
    dailyRewardsHistory,
    fetchRewardsHistory,
    claimDailyReward,
    checkDailyReward,
    isDailyRewardAvailable,
  } = useCoinsStore();

  // Reset claim state and fetch data when modal becomes visible
  useEffect(() => {
    if (visible) {
      setClaimedToday(false);
      setClaimAnimation(false);
      fetchRewardsHistory();
      checkDailyReward();
    }
  }, [visible, fetchRewardsHistory, checkDailyReward]);

  // Update claimed state based on global state
  useEffect(() => {
    if (!isDailyRewardAvailable) {
      setClaimedToday(true);
    }
  }, [isDailyRewardAvailable]);

  // Handle claiming reward
  const handleClaimReward = async () => {
    const rewardAmount = await claimDailyReward();
    if (rewardAmount) {
      setClaimAnimation(true);
      setClaimedToday(true);
      setTimeout(() => setClaimAnimation(false), 2000);
    }
    return rewardAmount;
  };

  // Generate monthly rewards data
  const generateMonthlyRewards = (): RewardDay[] => {
    const today = new Date();
    const todayFormatted = formatDateForComparison(today);
    const rewards: RewardDay[] = [];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    // Prepare claimed dates map for quick lookup
    const claimedDatesMap: Record<string, boolean> = {};
    if (dailyRewardsHistory?.claimedDates) {
      dailyRewardsHistory.claimedDates.forEach((claimed) => {
        const date = claimed.date.split("T")[0];
        claimedDatesMap[date] = true;
      });
    }

    // Generate data for each day in the month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const date = new Date(year, month, dayNum);
      const dateFormatted = formatDateForComparison(date);
      const reward = getDayRewardAmount(date);

      let status: "claimed" | "today" | "upcoming" | "missed" = "upcoming";

      // Determine status
      if (dateFormatted === todayFormatted) {
        status = isDailyRewardAvailable && !claimedToday ? "today" : "claimed";
      } else if (dateFormatted < todayFormatted) {
        status = claimedDatesMap[dateFormatted] ? "claimed" : "missed";
      }

      rewards.push({
        day: dayNum,
        date: dateFormatted,
        reward,
        status,
      });
    }

    return rewards;
  };

  const monthlyRewards = generateMonthlyRewards();
  const todayReward = getDayRewardAmount(new Date());

  // Get formatted month name and year
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  return {
    coins,
    claimAnimation,
    claimedToday,
    isDailyRewardAvailable,
    monthlyRewards,
    todayReward,
    monthName,
    year,
    handleClaimReward,
    setClaimAnimation,
  };
};

export default useRewards;
