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

// Define the Firebase function for OpenAI request
export const askAI = onRequest(async (req, res) => {
  try {
    // Log the incoming request headers and body
    console.log("Received request headers:", req.headers);
    console.log("Received request body:", JSON.stringify(req.body, null, 2));

    // Validate request body and check if prompt is provided
    if (!req.body || !req.body.prompt) {
      console.error("Error: Request body is missing or malformed");
      res.status(400).json({ error: "Missing prompt in request" });
      return;
    }

    const prompt = req.body.prompt; // Extract the prompt from the request
    console.log("Sending to OpenAI:", prompt);

    // Call OpenAI API to get the completion response
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Use GPT-4 model
      messages: [{ role: "user", content: prompt }],
    });

    // Log the AI response for debugging
    console.log("AI Response:", response);

    // Send the AI response back to the client
    res.status(200).json({ reply: response.choices[0].message.content });
  } catch (error) {
    // Log the error if something goes wrong
    console.error("OpenAI API Error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    // Respond with a 500 error if AI call fails
    res.status(500).json({ error: "Failed to communicate with OpenAI" });
  }
});
