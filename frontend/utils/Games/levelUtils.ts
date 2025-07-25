import useGameStore from "@/store/games/useGameStore";
import React from 'react';
/**
 * Helper function to get next level title with level string
 * @param gameMode - The game mode (multipleChoice, identification, fillBlanks)
 * @param currentLevelId - Current level ID
 * @param difficulty - Current difficulty
 * @returns Formatted next level title string
 */
export const getNextLevelTitle = (
  gameMode: string,
  currentLevelId: number,
  difficulty: string
): string => {
  const { getLevelData } = useGameStore.getState();

  const nextLevelId = currentLevelId + 1;
  const nextLevel = getLevelData(gameMode, nextLevelId, difficulty);

  let nextLevelData = null;

  if (nextLevel && nextLevel.levelData) {
    nextLevelData = {
      title: nextLevel.levelData.title,
      level: nextLevel.levelData.level,
    };
  } else if (nextLevel) {
    nextLevelData = {
      title: nextLevel.title,
      level: nextLevel.level,
    };
  }

  if (nextLevelData?.level && nextLevelData?.title) {
    // Use the actual level string from the data
    return `${nextLevelData.level} - ${nextLevelData.title}`;
  } else if (nextLevelData?.level) {
    return nextLevelData.level;
  } else if (nextLevelData?.title) {
    // Fallback: construct level string
    return `Level ${nextLevelId} - ${nextLevelData.title}`;
  }

  return `Level ${nextLevelId}`;
};

/**
 * Hook version for use in React components
 * @param gameMode - The game mode
 * @param currentLevelId - Current level ID
 * @param difficulty - Current difficulty
 * @returns Object with nextLevelData and getNextLevelTitle function
 */
export const useNextLevelData = (
  gameMode: string,
  currentLevelId: number,
  difficulty: string
) => {
  const { getLevelData } = useGameStore();

  const nextLevelData = React.useMemo(() => {
    const nextLevelId = currentLevelId + 1;
    const nextLevel = getLevelData(gameMode, nextLevelId, difficulty);

    if (nextLevel && nextLevel.levelData) {
      return {
        title: nextLevel.levelData.title,
        level: nextLevel.levelData.level,
      };
    } else if (nextLevel) {
      return {
        title: nextLevel.title,
        level: nextLevel.level,
      };
    }

    return null;
  }, [currentLevelId, difficulty, getLevelData, gameMode]);

  const getTitle = React.useCallback(() => {
    return getNextLevelTitle(gameMode, currentLevelId, difficulty);
  }, [gameMode, currentLevelId, difficulty]);

  return {
    nextLevelData,
    getNextLevelTitle: getTitle,
  };
};
