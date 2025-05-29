const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const QuizQuestion = require("../models/quizQuestion.model");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check if we have a MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables");
  console.log("Please check your .env file in the backend directory");
  process.exit(1);
}

const transformQuestions = (questionsArray) => {
  return questionsArray.map(question => {
    // Base question object with properties common to all types
    const transformedQuestion = {
      id: question.questionId || question.id,
      level: question.level || `Level ${question.id}`,
      difficulty: question.difficulty,
      mode: question.mode,
      title: question.title,
      description: question.description,
      question: question.question,
      translation: question.translation,
      dialect: question.dialect
    };

    // Add mode-specific properties
    if (question.mode === "multipleChoice" && question.options) {
      transformedQuestion.options = question.options;
    }

    if (question.mode === "identification") {
      transformedQuestion.targetWord = question.targetWord;
      transformedQuestion.choices = question.options || [];
    }

    if (question.mode === "fillBlanks") {
      transformedQuestion.targetWord = question.targetWord;
      transformedQuestion.hint = question.hint;
    }

    return transformedQuestion;
  });
};

const seedQuizQuestions = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    console.log(`Using connection string: ${process.env.MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, "mongodb$1://**:**@")}`);

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
    });

    console.log("Connected to MongoDB successfully");

    // Clear existing data
    console.log("Clearing existing quiz questions data...");
    await QuizQuestion.deleteMany({});

    // Read the quiz questions data
    const filePath = path.join(__dirname, "quizQuestions.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Transform the questions
    const questions = transformQuestions(data.questions);

    console.log(`Found ${questions.length} quiz questions to seed...`);

    // Insert data in batches to avoid overwhelming the database
    const batchSize = 50;
    const totalBatches = Math.ceil(questions.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, questions.length);
      const batch = questions.slice(start, end);

      console.log(`Seeding batch ${i + 1}/${totalBatches} (${batch.length} questions)...`);
      await QuizQuestion.insertMany(batch, { ordered: false });
    }

    console.log("✅ Quiz questions data seeded successfully!");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding quiz questions data:", error);
    process.exit(1);
  }
};

seedQuizQuestions();