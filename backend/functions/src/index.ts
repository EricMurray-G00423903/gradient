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
export const generateQuizQuestions = onRequest(async (req, res) => {
  try {
    const { moduleName, proficiencyScore, moduleDescription } = req.body;

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
      You are a quiz generation AI. Create 10 multiple-choice questions for the module "${moduleName}".

      User's Proficiency Level: ${proficiencyLevel}
      Module Description: ${moduleDescription}

      Response Format (JSON STRICT):
      {
        "questions": [
          {
            "question": "Example Question?",
            "answers": {
              "A": "Example Answer A",
              "B": "Example Answer B",
              "C": "Example Answer C",
              "D": "Example Answer D"
            },
            "correctAnswer": "C",
            "topic": "Example Sub Topic"
          }
        ]
      }

      Rules:
      - Ensure each question has exactly 4 answer choices (A, B, C, D).
      - Provide the correct answer as a single letter.
      - Assign a subtopic.
      - Adjust difficulty to match ${proficiencyLevel}.
      - Questions must be relevant to the module.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    // Extract JSON response safely
    const quizData = response.choices[0]?.message?.content ?? "{}"; // Default to empty JSON object if null

    try {
      const parsedQuizData = JSON.parse(quizData);
      res.status(200).json(parsedQuizData);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      res.status(500).json({ error: "Invalid JSON received from OpenAI" });
    }

  } catch (error) { 
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});