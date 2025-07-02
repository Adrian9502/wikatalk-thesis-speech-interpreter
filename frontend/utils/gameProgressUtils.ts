import useGameStore from "@/store/games/useGameStore";

export const detectGameModeFromQuizId = (
  quizId: string | number
): string | null => {
  const { questions } = useGameStore.getState();

  let numericId: number;
  if (typeof quizId === "string") {
    const cleanId = quizId.replace(/^n-/, "");
    numericId = parseInt(cleanId, 10);
  } else {
    numericId = quizId;
  }

  // Only log in development and reduce frequency
  const shouldLog = __DEV__ && Math.random() < 0.1; // Log only 10% of calls
  if (shouldLog) {
    console.log(`[detectGameModeFromQuizId] Looking for quiz ID: ${numericId}`);
  }

  for (const [mode, difficulties] of Object.entries(questions)) {
    if (!difficulties || typeof difficulties !== 'object') continue;
    
    for (const [difficulty, questionList] of Object.entries(difficulties)) {
      if (!Array.isArray(questionList)) continue;
      
      const found = questionList.some((q: any) => {
        const qId = q.id || q.questionId;
        return qId === numericId;
      });

      if (found) {
        if (shouldLog) {
          console.log(`[detectGameModeFromQuizId] Found quiz ${numericId} in ${mode}.${difficulty}`);
        }
        return mode;
      }
    }
  }

  if (shouldLog) {
    console.warn(`[detectGameModeFromQuizId] Could not find game mode for quiz ID: ${numericId}`);
  }
  return null;
};

export const categorizeProgressByGameMode = (progressEntries: any[]) => {
  console.log(
    `[categorizeProgressByGameMode] Processing ${progressEntries.length} progress entries`
  );

  const categorized: { [key: string]: any[] } = {
    multipleChoice: [],
    identification: [],
    fillBlanks: [],
  };

  progressEntries.forEach((entry, index) => {
    console.log(`[categorizeProgressByGameMode] Processing entry ${index}:`, {
      quizId: entry.quizId,
      completed: entry.completed,
      totalTimeSpent: entry.totalTimeSpent,
    });

    const gameMode = detectGameModeFromQuizId(entry.quizId);
    if (gameMode && categorized[gameMode]) {
      categorized[gameMode].push({
        ...entry,
        gameMode, // Add the detected game mode to the entry
      });
      console.log(`[categorizeProgressByGameMode] Added entry to ${gameMode}`);
    } else {
      console.warn(
        `[categorizeProgressByGameMode] Unknown game mode for entry:`,
        entry
      );
    }
  });

  // Log final results
  Object.entries(categorized).forEach(([mode, entries]) => {
    console.log(
      `[categorizeProgressByGameMode] ${mode}: ${entries.length} entries`
    );
  });

  return categorized;
};

// NEW: Helper function to get progress for a specific game mode
export const getGameModeProgressCount = (
  progressEntries: any[],
  gameMode: string
) => {
  if (!Array.isArray(progressEntries)) return { completed: 0, total: 0 };

  const gameModeEntries = progressEntries.filter((entry: any) => {
    const detectedMode = detectGameModeFromQuizId(entry.quizId);
    return detectedMode === gameMode;
  });

  return {
    completed: gameModeEntries.filter((entry) => entry.completed).length,
    total: gameModeEntries.length,
  };
};
