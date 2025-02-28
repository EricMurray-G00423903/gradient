import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI API with the API key from Firebase Functions config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate Quiz Questions from OpenAI
 */
export const generateQuizQuestions = onRequest(async (req, res): Promise<void> => {
  try {
    // Enable CORS for frontend requests
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    const { moduleName, proficiencyScore, moduleDescription } = req.body;

    if (!moduleName || proficiencyScore === undefined || !moduleDescription) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Convert Proficiency Score (0-100) into Readable Levels
    const getProficiencyLevel = (score: number): string => {
      if (score < 25) return "Beginner";
      if (score < 50) return "Intermediate";
      if (score < 75) return "Advanced";
      if (score < 90) return "Very Advanced";
      return "Expert";
    };

    const proficiencyLevel = getProficiencyLevel(proficiencyScore);

    // Define OpenAI Prompt
    const prompt = `
      You are an AI that generates multiple-choice quizzes for learning.
      Create 10 multiple-choice questions for the module "${moduleName}".
      Ensure difficulty level matches a ${proficiencyLevel} learner.
      Module Description: ${moduleDescription}

      Respond **ONLY** with **raw JSON format** (DO NOT include Markdown formatting, DO NOT wrap with triple backticks).

      {
        "questions": [
          {
            "question": "What is polymorphism in OOP?",
            "answers": {
              "A": "A design pattern",
              "B": "A type of variable",
              "C": "The ability of a function to operate on different data types",
              "D": "A data structure"
            },
            "correctAnswer": "C",
            "topic": "Polymorphism"
          }
        ]
      }
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    let quizData = response.choices[0]?.message?.content?.trim(); // Trim extra spaces

    if (!quizData) {
      console.error("Error: OpenAI response was empty.");
      res.status(500).json({ error: "Failed to generate quiz" });
      return;
    }

    try {
      // 🔥 FORCE JSON CLEANUP 🔥
      // Remove Markdown formatting (` ```json ... ``` `) if present
      quizData = quizData.replace(/^```json\s*/g, "").replace(/```$/g, "").trim();

      console.log("Received OpenAI Response:", quizData); // Debug log

      const parsedQuizData = JSON.parse(quizData); // Parse the cleaned JSON
      res.status(200).json(parsedQuizData);
    } catch (error) {
      console.error("❌ Error parsing OpenAI response:", error, "\n🔍 Raw Data:", quizData);
      res.status(500).json({ error: "Invalid JSON received from OpenAI", rawResponse: quizData });
    }

  } catch (error) {
    console.error("🔥 Error generating quiz:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
