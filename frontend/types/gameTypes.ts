export type GameRoute =
  | "/(games)/MultipleChoice"
  | "/(games)/Identification"
  | "/(games)/FillInTheBlank";

export type GameMode = "multipleChoice" | "identification" | "fillBlanks";
export type Difficulty = "easy" | "medium" | "hard";
export type GameStatus = "idle" | "playing" | "completed";

// Define level structure
export interface LevelData {
  id: number;
  number: number;
  levelString: string;
  title: string;
  description: string;
  difficulty: string;
  status: "completed" | "current" | "locked";
  stars: number;
  focusArea: string;
  questionData: any;
  difficultyCategory: string;
}

// Question interfaces
export interface QuestionBase {
  id?: number;
  questionId?: number;
  level: string;
  difficulty: Difficulty;
  mode: GameMode;
  title: string;
  description?: string;
  question: string;
  translation?: string;
  dialect?: string;
  focusArea?: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface IdentificationQuestion extends QuestionBase {
  answer: string;
  choices?: string[];
  sentence: string;
}

export interface FillInTheBlankQuestion extends QuestionBase {
  answer: string;
  hint?: string;
  sentence: string;
}

export type QuestionType =
  | MultipleChoiceQuestion
  | IdentificationQuestion
  | FillInTheBlankQuestion;

// Quiz questions data structure
export interface QuizQuestions {
  multipleChoice: { [key in Difficulty]: MultipleChoiceQuestion[] };
  identification: { [key in Difficulty]: IdentificationQuestion[] };
  fillBlanks: { [key in Difficulty]: FillInTheBlankQuestion[] };
  [key: string]: { [key: string]: any[] };
}
