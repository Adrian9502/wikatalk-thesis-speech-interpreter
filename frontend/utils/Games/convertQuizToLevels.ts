import { LevelData, QuizQuestions } from "@/types/gameTypes";

export const convertQuizToLevels = (
  gameMode: string,
  quizData: QuizQuestions,
  userProgressData: any[] = []
): LevelData[] => {
  console.log(`[convertQuizToLevels] Converting ${gameMode} with:`, {
    gameMode,
    quizDataKeys: Object.keys(quizData),
    hasGameModeData: !!quizData[gameMode],
    progressCount: userProgressData.length,
  });

  // Ensure gameMode is a string, not an array
  const safeGameMode =
    typeof gameMode === "string" ? gameMode : String(gameMode);

  // Check if the gameMode exists in quizData
  if (!quizData[safeGameMode]) {
    console.warn(`[convertQuizToLevels] No data found for gameMode: ${safeGameMode}`);
    console.log(`[convertQuizToLevels] Available modes:`, Object.keys(quizData));
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

  // Helper function to determine level status based on progress
  const getLevelStatus = (questionId: number): "completed" | "current" | "locked" => {
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

    return levelProgress ? "completed" : "current";
  };

  // Convert to level objects
  const allLevels: LevelData[] = allQuestions.map((item: any, index: number) => {
    const questionId = item.questionId || item.id || index + 1;
    const levelStatus = getLevelStatus(questionId);

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

  const completedCount = allLevels.filter((l) => l.status === "completed")
    .length;
  console.log(
    `[convertQuizToLevels] Final result: ${allLevels.length} levels for ${gameMode} (${completedCount} completed)`
  );

  return allLevels;
};