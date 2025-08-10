import { LevelData, QuizQuestions } from "@/types/gameTypes";

export const convertQuizToLevels = async (
  gameMode: string,
  quizData: QuizQuestions,
  userProgressData: any[] = []
): Promise<LevelData[]> => {
  // REDUCED: Only log in development and less frequently
  if (__DEV__ && Math.random() < 0.1) {
    // Only 10% of calls in dev
    console.log(`[convertQuizToLevels] Converting ${gameMode} with:`, {
      gameMode,
      quizDataKeys: Object.keys(quizData),
      hasGameModeData: !!quizData[gameMode],
      progressCount: userProgressData.length,
    });
  }

  // Ensure gameMode is a string, not an array
  const safeGameMode =
    typeof gameMode === "string" ? gameMode : String(gameMode);

  // Check if the gameMode exists in quizData
  if (!quizData[safeGameMode]) {
    console.warn(
      `[convertQuizToLevels] No data found for gameMode: ${safeGameMode}`
    );
    console.log(
      `[convertQuizToLevels] Available modes:`,
      Object.keys(quizData)
    );
    return [];
  }

  const modeData = quizData[safeGameMode];
  console.log(`[convertQuizToLevels] Mode data structure:`, {
    difficulties: Object.keys(modeData),
    totalQuestions: Object.values(modeData).reduce(
      (acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0),
      0
    ),
  });

  // Get difficulties and ensure they're strings
  const difficulties = Object.keys(modeData);

  // Collect all questions from all difficulties
  let allQuestions: any[] = [];

  difficulties.forEach((difficulty: string) => {
    const difficultyQuestions = modeData[difficulty] || [];
    console.log(
      `[convertQuizToLevels] ${safeGameMode}.${difficulty}: ${difficultyQuestions.length} questions`
    );

    // Add all questions with their difficulty
    difficultyQuestions.forEach((question: any) => {
      // Ensure proper data structure
      const processedQuestion = {
        ...question,
        difficultyCategory: difficulty,
        questionId: question.questionId || question.id,
        // Ensure options are properly structured for multiple choice
        options: question.options
          ? question.options.map((opt: any, index: number) => ({
              id: opt.id || String.fromCharCode(65 + index), // A, B, C, D
              text:
                typeof opt.text === "string"
                  ? opt.text
                  : String(opt.text || opt.label || ""),
              isCorrect: opt.isCorrect || false,
              _id: opt._id,
            }))
          : undefined,
      };

      allQuestions.push(processedQuestion);
    });
  });

  // Sort all questions by their questionId or id
  allQuestions.sort((a: any, b: any) => {
    const idA = a.questionId || a.id || 0;
    const idB = b.questionId || b.id || 0;
    return idA - idB;
  });

  console.log(
    `[convertQuizToLevels] Total questions after sorting: ${allQuestions.length}`
  );

  // Calculate difficulty completion stats for locking logic
  const difficultyStats = {
    easy: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    hard: { total: 0, completed: 0 },
  };

  // Count total questions per difficulty
  allQuestions.forEach((question) => {
    const diff = question.difficultyCategory?.toLowerCase() || "easy";
    if (difficultyStats[diff as keyof typeof difficultyStats]) {
      difficultyStats[diff as keyof typeof difficultyStats].total++;
    }
  });

  // Count completed questions per difficulty
  userProgressData.forEach((progress) => {
    if (!progress.completed) return;

    let progressQuizId: number;
    if (typeof progress.quizId === "string") {
      const cleanId = progress.quizId.replace(/^n-/, "");
      progressQuizId = parseInt(cleanId, 10);
    } else {
      progressQuizId = progress.quizId;
    }

    // Find the question with this ID to get its difficulty
    const question = allQuestions.find((q) => {
      const questionId = q.questionId || q.id;
      return questionId === progressQuizId;
    });

    if (question) {
      const diff = question.difficultyCategory?.toLowerCase() || "easy";
      if (difficultyStats[diff as keyof typeof difficultyStats]) {
        difficultyStats[diff as keyof typeof difficultyStats].completed++;
      }
    }
  });

  // Determine if difficulty tiers should be unlocked
  const isEasyComplete =
    difficultyStats.easy.total > 0 &&
    difficultyStats.easy.completed >= difficultyStats.easy.total;
  const isMediumComplete =
    difficultyStats.medium.total > 0 &&
    difficultyStats.medium.completed >= difficultyStats.medium.total;

  // REDUCED: Only log completion status summary
  if (__DEV__) {
    console.log(`[convertQuizToLevels] ${gameMode} completion:`, {
      easy: `${difficultyStats.easy.completed}/${difficultyStats.easy.total}`,
      medium: `${difficultyStats.medium.completed}/${difficultyStats.medium.total}`,
      hard: `${difficultyStats.hard.completed}/${difficultyStats.hard.total}`,
      totalLevels: allQuestions.length,
    });
  }

  // Helper function to determine level status based on progress and locking rules
  const getLevelStatus = (
    questionId: number,
    difficulty: string
  ): "completed" | "current" | "locked" => {
    const difficultyLower = difficulty.toLowerCase();

    // Check if level is completed first
    const levelProgress = userProgressData.find((progress) => {
      let progressQuizId: number;

      if (typeof progress.quizId === "string") {
        const cleanId = progress.quizId.replace(/^n-/, "");
        progressQuizId = parseInt(cleanId, 10);
      } else {
        progressQuizId = progress.quizId;
      }

      return progressQuizId === questionId && progress.completed === true;
    });

    if (levelProgress) {
      return "completed";
    }

    // Apply locking rules
    switch (difficultyLower) {
      case "easy":
        // Easy levels are always unlocked
        return "current";

      case "medium":
        // Medium levels are locked until all easy levels are completed
        if (!isEasyComplete) {
          // REMOVED: Individual level lock logging
          return "locked";
        }
        return "current";

      case "hard":
        // Hard levels are locked until all medium levels are completed
        if (!isMediumComplete) {
          // REMOVED: Individual level lock logging
          return "locked";
        }
        return "current";

      default:
        return "current";
    }
  };

  // OPTIMIZED: Batch process large datasets
  const BATCH_SIZE = 20;
  const allLevels: LevelData[] = [];

  // Process questions in batches to avoid blocking main thread
  for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
    const batch = allQuestions.slice(i, i + BATCH_SIZE);

    const batchLevels = batch.map((item: any, index: number) => {
      const globalIndex = i + index;
      const questionId = item.questionId || item.id || globalIndex + 1;
      const difficulty = item.difficultyCategory || "easy";
      const levelStatus = getLevelStatus(questionId, difficulty);

      const level: LevelData = {
        id: questionId,
        number: questionId,
        levelString: item.level || `Level ${questionId}`,
        title: item.title || `Level ${questionId}`,
        description: item.description || "Practice your skills",
        difficulty:
          typeof item.difficultyCategory === "string"
            ? item.difficultyCategory.charAt(0).toUpperCase() +
              item.difficultyCategory.slice(1)
            : "Easy",
        status: levelStatus,
        stars: levelStatus === "completed" ? 3 : Math.floor(Math.random() * 3),
        focusArea:
          item.focusArea && item.focusArea !== "undefined"
            ? item.focusArea.charAt(0).toUpperCase() + item.focusArea.slice(1)
            : "Vocabulary",
        questionData: item,
        difficultyCategory: item.difficultyCategory || "easy",
      };

      return level;
    });

    allLevels.push(...batchLevels);

    // OPTIMIZATION: Yield control periodically for large datasets
    if (i > 0 && i % (BATCH_SIZE * 5) === 0) {
      // Let React Native render frame before continuing
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  const completedCount = allLevels.filter(
    (l) => l.status === "completed"
  ).length;
  const lockedCount = allLevels.filter((l) => l.status === "locked").length;

  // REDUCED: Only log final summary
  if (__DEV__) {
    console.log(
      `[convertQuizToLevels] ${gameMode}: ${allLevels.length} levels (${completedCount} completed, ${lockedCount} locked)`
    );
  }

  return allLevels;
};
