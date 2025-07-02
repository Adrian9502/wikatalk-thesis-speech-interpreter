import useGameStore from "@/store/games/useGameStore";

export const detectGameModeFromQuizId = (
  quizId: string | number
): string | null => {
  const { questions } = useGameStore.getState();

  // Convert to number if string (handle both "123" and "n-123" formats)
  let numericId: number;
  if (typeof quizId === "string") {
    const cleanId = quizId.replace(/^n-/, "");
    numericId = parseInt(cleanId, 10);
  } else {
    numericId = quizId;
  }

  console.log(`[detectGameModeFromQuizId] Looking for quiz ID: ${numericId}`);

  // Check each game mode for this quiz ID
  for (const [mode, difficulties] of Object.entries(questions)) {
    for (const [difficulty, questionList] of Object.entries(difficulties)) {
      const found = questionList.some((q: any) => {
        const qId = q.id || q.questionId;
        const match = qId === numericId;
        if (match) {
          console.log(
            `[detectGameModeFromQuizId] Found quiz ${numericId} in ${mode}.${difficulty}`
          );
        }
        return match;
      });

      if (found) {
        return mode;
      }
    }
  }

  console.warn(
    `[detectGameModeFromQuizId] Could not find game mode for quiz ID: ${numericId}`
  );
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
        gameMode,
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
