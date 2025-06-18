import { LevelData, QuizQuestions } from "@/types/gameTypes";

export const convertQuizToLevels = (
  gameMode: string,
  quizData: QuizQuestions,
  userProgressData: any[] = []
): LevelData[] => {
  console.log(`[convertQuizToLevels] Converting ${gameMode} data with ${userProgressData.length} progress entries`);

  // Ensure gameMode is a string, not an array
  const safeGameMode =
    typeof gameMode === "string" ? gameMode : String(gameMode);

  // Check if the gameMode exists in quizData
  if (!quizData[safeGameMode]) return [];

  // Get difficulties and ensure they're strings
  const difficulties = Object.keys(quizData[safeGameMode]);
  console.log(`Found difficulties for ${safeGameMode}:`, difficulties);

  // First, collect all questions from all difficulties
  let allQuestions: any[] = [];

  difficulties.forEach((difficulty: string | any) => {
    // Ensure difficulty is a string, not an array
    const difficultyKey =
      typeof difficulty === "string"
        ? difficulty
        : Array.isArray(difficulty) && difficulty.length > 0
        ? String(difficulty[0])
        : "easy";

    // Access the questions using the safe string key
    const difficultyQuestions = quizData[safeGameMode][difficultyKey] || [];
    console.log(
      `${safeGameMode}/${difficultyKey}: ${difficultyQuestions.length} questions`
    );

    // Add all questions with their difficulty
    difficultyQuestions.forEach((question: any) => {
      allQuestions.push({
        ...question,
        difficultyCategory: difficultyKey,
      });
    });
  });

  // Sort all questions by their questionId or id
  allQuestions.sort((a: any, b: any) => {
    const idA = a.questionId || a.id || 0;
    const idB = b.questionId || b.id || 0;
    return idA - idB;
  });

  // ENHANCED: Helper function to determine level status based on progress
  const getLevelStatus = (questionId: number): "completed" | "current" | "locked" => {
    // Check if this level has been completed in user progress
    const levelProgress = userProgressData.find(progress => {
      // Handle both string and number quiz IDs with proper parsing
      let progressQuizId: number;
      
      if (typeof progress.quizId === 'string') {
        // Remove any prefix and parse to number
        const cleanId = progress.quizId.replace(/^n-/, '');
        progressQuizId = parseInt(cleanId, 10);
      } else {
        progressQuizId = progress.quizId;
      }
      
      const isMatched = progressQuizId === questionId && progress.completed === true;
      
      if (isMatched) {
        console.log(`[convertQuizToLevels] Level ${questionId} marked as COMPLETED based on progress:`, {
          progressQuizId,
          questionId,
          completed: progress.completed,
          attempts: progress.attempts?.length || 0
        });
      }
      
      return isMatched;
    });

    if (levelProgress) {
      return "completed";
    }

    // For now, make all non-completed levels current (unlocked)
    return "current";
  };

  // Now map the sorted questions to level objects
  const allLevels: LevelData[] = allQuestions.map(
    (item: any, index: number) => {
      const questionId = item.questionId || item.id || index + 1;
      const levelStatus = getLevelStatus(questionId);

      // Create a level with the proper id and number
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
        status: levelStatus, // Use dynamic status based on progress
        stars: levelStatus === "completed" ? 3 : Math.floor(Math.random() * 3),
        focusArea: item.focusArea
          ? item.focusArea.charAt(0).toUpperCase() + item.focusArea.slice(1)
          : item.description?.includes("grammar")
          ? "Grammar"
          : item.description?.includes("pronunciation")
          ? "Pronunciation"
          : "Vocabulary",
        questionData: item,
        difficultyCategory: item.difficultyCategory || "easy",
      };

      return level;
    }
  );

  const completedCount = allLevels.filter(l => l.status === 'completed').length;
  console.log(`[convertQuizToLevels] Converted ${allLevels.length} levels for ${gameMode} with ${completedCount} completed levels`);
  
  // Debug: Log completed levels for troubleshooting
  if (completedCount > 0) {
    const completedLevels = allLevels.filter(l => l.status === 'completed');
    console.log('[convertQuizToLevels] Completed levels:', completedLevels.map(l => ({ id: l.id, status: l.status, title: l.title })));
  }
  
  return allLevels;
};