import { LevelData, QuizQuestions } from "@/types/gameTypes";

export const convertQuizToLevels = (
  gameMode: string,
  quizData: QuizQuestions
): LevelData[] => {
  console.log(`Attempting to convert ${gameMode} data`);

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

  // Now map the sorted questions to level objects
  const allLevels: LevelData[] = allQuestions.map(
    (item: any, index: number) => {
      // Make all levels either completed or current
      const status = "current";

      // Create a level with the proper id and number
      const level: LevelData = {
        id: item.questionId || item.id || index + 1,
        number: item.questionId || item.id || index + 1,
        levelString:
          item.level || `Level ${item.questionId || item.id || index + 1}`,
        title: item.title || `Level ${item.questionId || item.id || index + 1}`,
        description: item.description || "Practice your skills",
        difficulty:
          typeof item.difficultyCategory === "string"
            ? item.difficultyCategory.charAt(0).toUpperCase() +
              item.difficultyCategory.slice(1)
            : "Easy",
        status: status as "completed" | "current" | "locked",
        stars: status === "completed" ? 3 : Math.floor(Math.random() * 3),
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

  console.log(
    `Converted ${allLevels.length} levels for ${gameMode} in proper order`
  );
  return allLevels;
};
