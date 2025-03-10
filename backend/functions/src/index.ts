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

// Convert Proficiency Score (0-100) into Readable Levels
const getProficiencyLevel = (score: number): string => {
  if (score < 25) return "Beginner";
  if (score < 50) return "Intermediate";
  if (score < 75) return "Advanced";
  if (score < 90) return "Very Advanced";
  return "Expert";
};

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
      console.error("OpenAI returned an empty response.");
      res.status(500).json({ error: "Failed to generate quiz" });
      return;
    }

    try {
      // FORCE JSON CLEANUP 
      // Remove Markdown formatting (` ```json ... ``` `) if present
      quizData = quizData.replace(/^```json/g, "").replace(/```$/g, "").trim();

      console.log("Received OpenAI Response:", quizData); // Debug log

      // Extra Safety: Check if response starts with `{` (ensures it's JSON)
      if (!quizData.startsWith("{")) {
        console.error("OpenAI response does not start with JSON format!");
        throw new Error("OpenAI did not return valid JSON format.");
      }

      const parsedQuizData = JSON.parse(quizData); // Parse the cleaned JSON
      res.status(200).json(parsedQuizData);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error, "\n🔍 Raw Data:", quizData);
      res.status(500).json({ error: "Invalid JSON received from OpenAI", rawResponse: quizData });
    }

  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Generate Study Plan from OpenAI
 */
export const generateStudyPlan = onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*"); // Allow frontend requests
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    const { moduleName, moduleDescription, proficiency, weakTopics } = req.body;

    if (!moduleName || !moduleDescription || proficiency === undefined || !weakTopics) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const proficiencyLevel = getProficiencyLevel(proficiency);

    // Define OpenAI Prompt
    const prompt = `
      You are an AI tutor generating study plans.
      The user is learning **${moduleName}**.
      Their **current proficiency** is **${proficiency}%**.
      **Last Test Difficulty**: ${proficiencyLevel}.
      **Module Description**: ${moduleDescription}.
      Their **weak topics** from the last quiz: ${weakTopics.join(", ")}.

      **Task**:
      - Generate **3-4 key study points** they should focus on to improve, suggest sources to learn each study point specifically.
      - Provide **1 small practical exercise** for hands-on practice.
      - The exercise should be **short**, no bigger than a simple lab task, try make it fun where possible.

      **Response Format (Strict JSON, no markdown, no extra text)**:
      {
        "studyTasks": [
          "Task 1",
          "Task 2",
          "Task 3",
          "Task 4"
        ],
        "exercise": "A simple exercise description here."
      }
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    let studyPlan = response.choices[0]?.message?.content?.trim();

    if (!studyPlan) {
      console.error("OpenAI response empty.");
      res.status(500).json({ error: "Failed to generate study plan" });
      return;
    }

    try {
      // Clean up JSON response
      studyPlan = studyPlan.replace(/^```json\s*/g, "").replace(/```$/g, "").trim();
      console.log("Received OpenAI Response:", studyPlan);

      const parsedStudyPlan = JSON.parse(studyPlan);
      res.status(200).json(parsedStudyPlan);
    } catch (error) {
      console.error("JSON Parsing Error:", error, "\n🔍 Raw Data:", studyPlan);
      res.status(500).json({ error: "Invalid JSON from OpenAI", rawResponse: studyPlan });
    }

  } catch (error) {
    console.error("Error generating study plan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }

  
});

/**
 * Generate AI-Powered Project Idea
 */
export const generateProject = onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    const { moduleName, proficiencyLevel } = req.body;

    // Debug request payload
    console.log("Received request:", { moduleName, proficiencyLevel });

    if (!moduleName || proficiencyLevel === undefined) {
      console.error("Missing required fields");
      res.status(400).json({ error: "Missing required fields (moduleName, proficiencyLevel)" });
      return;
    }

    // Convert proficiency level to project difficulty
    let difficulty;
    if (proficiencyLevel >= 80) difficulty = "Advanced";
    else if (proficiencyLevel >= 50) difficulty = "Intermediate";
    else difficulty = "Beginner";

    const prompt = `
      The user is learning **${moduleName}**.
      Their proficiency level is **${proficiencyLevel}%**, which is considered **${difficulty}**.

      **Task**:
      - Suggest a project idea that is **${difficulty} difficulty**.
      - Keep the project **simple for beginners, more complex for advanced users**.

      **Response Format (JSON only, no markdown, no extra text)**:
      {
        "description": "A short project idea description."
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    let projectData = response.choices[0]?.message?.content?.trim();

    if (!projectData) {
      console.error("OpenAI returned an empty response.");
      res.status(500).json({ error: "Failed to generate project" });
      return;
    }

    // Clean response to ensure valid JSON
    projectData = projectData.replace(/^```json\s*/g, "").replace(/```$/g, "").trim();
    const parsedProject = JSON.parse(projectData);

    console.log("Successfully generated project:", parsedProject);
    res.status(200).json(parsedProject);

  } catch (error) {
    console.error("Error generating project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

