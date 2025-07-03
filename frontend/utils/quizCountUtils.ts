import useGameStore from "@/store/games/useGameStore";

/**
 * Get total quiz count across all game modes and difficulties
 */
export const getTotalQuizCount = (): number => {
  const { questions } = useGameStore.getState();
  console.log(
    "[getTotalQuizCount] Current questions state:",
    JSON.stringify(questions, null, 2).substring(0, 200) + "..."
  );
  let totalCount = 0;

  Object.entries(questions).forEach(([gameMode, difficulties]) => {
    if (difficulties && typeof difficulties === "object") {
      Object.entries(difficulties).forEach(([difficulty, questionList]) => {
        if (Array.isArray(questionList)) {
          totalCount += questionList.length;
        }
      });
    }
  });

  console.log(`[getTotalQuizCount] Total quiz count: ${totalCount}`);
  return totalCount;
};

/**
 * Get quiz count for a specific game mode
 */
export const getQuizCountByMode = (mode: string): number => {
  const { questions } = useGameStore.getState();
  const modeQuestions = questions[mode];

  if (!modeQuestions || typeof modeQuestions !== "object") {
    console.log(`[getQuizCountByMode] No questions found for mode: ${mode}`);
    return 0;
  }

  let modeCount = 0;
  Object.values(modeQuestions).forEach((questionList) => {
    if (Array.isArray(questionList)) {
      modeCount += questionList.length;
    }
  });

  console.log(`[getQuizCountByMode] Quiz count for ${mode}: ${modeCount}`);
  return modeCount;
};

/**
 * Get quiz count for a specific difficulty in a game mode
 */
export const getQuizCountByDifficulty = (
  mode: string,
  difficulty: string
): number => {
  const { questions } = useGameStore.getState();
  const modeQuestions = questions[mode];

  if (!modeQuestions || typeof modeQuestions !== "object") {
    console.log(
      `[getQuizCountByDifficulty] No questions found for mode: ${mode}`
    );
    return 0;
  }

  const difficultyQuestions = modeQuestions[difficulty];
  const count = Array.isArray(difficultyQuestions)
    ? difficultyQuestions.length
    : 0;

  console.log(
    `[getQuizCountByDifficulty] Quiz count for ${mode}.${difficulty}: ${count}`
  );
  return count;
};

/**
 * Get quiz counts for all difficulties in a specific game mode
 */
export const getQuizCountsByDifficulty = (
  mode: string
): {
  easy: number;
  medium: number;
  hard: number;
  total: number;
} => {
  const { questions } = useGameStore.getState();
  const modeQuestions = questions[mode];

  if (!modeQuestions || typeof modeQuestions !== "object") {
    console.log(
      `[getQuizCountsByDifficulty] No questions found for mode: ${mode}`
    );
    return { easy: 0, medium: 0, hard: 0, total: 0 };
  }

  const counts = {
    easy: Array.isArray(modeQuestions.easy) ? modeQuestions.easy.length : 0,
    medium: Array.isArray(modeQuestions.medium)
      ? modeQuestions.medium.length
      : 0,
    hard: Array.isArray(modeQuestions.hard) ? modeQuestions.hard.length : 0,
    total: 0,
  };

  counts.total = counts.easy + counts.medium + counts.hard;

  console.log(`[getQuizCountsByDifficulty] Counts for ${mode}:`, counts);
  return counts;
};

/**
 * Get quiz counts for all game modes
 */
export const getAllQuizCounts = (): {
  multipleChoice: number;
  identification: number;
  fillBlanks: number;
  total: number;
} => {
  const counts = {
    multipleChoice: getQuizCountByMode("multipleChoice"),
    identification: getQuizCountByMode("identification"),
    fillBlanks: getQuizCountByMode("fillBlanks"),
    total: 0,
  };

  counts.total =
    counts.multipleChoice + counts.identification + counts.fillBlanks;

  console.log(`[getAllQuizCounts] All quiz counts:`, counts);
  return counts;
};

/**
 * Check if questions are loaded for a specific mode
 */
export const areQuestionsLoadedForMode = (mode: string): boolean => {
  const { questions } = useGameStore.getState();
  const modeQuestions = questions[mode];

  if (!modeQuestions || typeof modeQuestions !== "object") {
    return false;
  }

  const hasQuestions = Object.values(modeQuestions).some(
    (difficulty) => Array.isArray(difficulty) && difficulty.length > 0
  );

  console.log(
    `[areQuestionsLoadedForMode] Questions loaded for ${mode}: ${hasQuestions}`
  );
  return hasQuestions;
};

/**
 * Check if any questions are loaded
 */
export const areAnyQuestionsLoaded = (): boolean => {
  const { questions } = useGameStore.getState();

  const hasQuestions = Object.values(questions).some((gameMode) =>
    Object.values(gameMode).some(
      (difficulty) => Array.isArray(difficulty) && difficulty.length > 0
    )
  );

  console.log(`[areAnyQuestionsLoaded] Any questions loaded: ${hasQuestions}`);
  return hasQuestions;
};

/**
 * Get detailed breakdown of all quiz counts
 */
export const getDetailedQuizBreakdown = (): {
  multipleChoice: { easy: number; medium: number; hard: number; total: number };
  identification: { easy: number; medium: number; hard: number; total: number };
  fillBlanks: { easy: number; medium: number; hard: number; total: number };
  grandTotal: number;
} => {
  const breakdown = {
    multipleChoice: getQuizCountsByDifficulty("multipleChoice"),
    identification: getQuizCountsByDifficulty("identification"),
    fillBlanks: getQuizCountsByDifficulty("fillBlanks"),
    grandTotal: 0,
  };

  breakdown.grandTotal =
    breakdown.multipleChoice.total +
    breakdown.identification.total +
    breakdown.fillBlanks.total;

  console.log(`[getDetailedQuizBreakdown] Detailed breakdown:`, breakdown);
  return breakdown;
};
