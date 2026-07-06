import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Shared Gemini client utility with telemetry headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Practice session chat with Coaches (Klaus Müller, Sarah Jenkins, Custom)
  app.post("/api/coach-chat", async (req, res) => {
    try {
      const { coachId, messages, customPrompt } = req.body;

      let systemInstruction = "";
      if (coachId === "klaus") {
        systemInstruction = 
          "You are Klaus Müller, a direct, demanding, and highly structured German corporate customer. " +
          "You are reviewing a software integration proposal. You expect concrete details, data, risk mitigation, and clear timelines. " +
          "Speak with a professional, very direct German business tone. Do not use vague reassurance. " +
          "Keep your verbal responses concise (under 75 words) and highly professional. " +
          "In addition to your verbal response, you must provide a 'hint' - a brief, constructive piece of business etiquette coaching " +
          "written from a neutral, expert coach's perspective about how the user can improve their communication with direct German business partners.";
      } else if (coachId === "sarah") {
        systemInstruction = 
          "You are Sarah Jenkins, a friendly but firm US Purchasing Manager. You are focused on cost-efficiency, vendor relationships, and contract terms. " +
          "You prefer a bit of relationship building/small talk but hold a firm line on negotiating prices and flexible delivery dates. " +
          "Keep your verbal responses concise (under 75 words). " +
          "In addition to your verbal response, you must provide a 'hint' - a brief, constructive piece of business etiquette coaching " +
          "written from a neutral, expert coach's perspective about how the user can improve their negotiations and persuasive style in US business contexts.";
      } else {
        // Custom scenario
        systemInstruction = 
          `You are an AI Professional English Coach simulating this specific role/scenario: "${customPrompt || "A business negotiation"}" ` +
          "Engage in a realistic, professional dialog. Keep your verbal responses concise (under 75 words). " +
          "In addition to your verbal response, you must provide a 'hint' - a brief, constructive piece of business etiquette or language " +
          "coaching written from a neutral, expert coach's perspective about how the user did in their last message.";
      }

      // Convert messages list to Gemini API format
      // messages: array of { role: 'user' | 'assistant', content: string }
      // In @google/genai, roles are 'user' and 'model'
      const contents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "The coach's next verbal response in the negotiation dialog.",
              },
              hint: {
                type: Type.STRING,
                description: "A tailored, helpful business etiquette hint or tip for the user based on cultural context or persuasion style.",
              },
            },
            required: ["text", "hint"],
          },
        },
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/coach-chat:", error);
      res.status(500).json({
        text: "Entschuldigung, I encountered an error processing your response. Please try speaking again.",
        hint: "System note: Verify your API key configuration and try again.",
      });
    }
  });

  // API Route: AI Pronunciation Coach
  app.post("/api/pronunciation-feedback", async (req, res) => {
    try {
      const { term, text } = req.body;

      const systemInstruction =
        "You are an AI English Pronunciation Coach. Your goal is to analyze the user's spoken transcription " +
        `for the business English term: "${term}". ` +
        "You should assess if the transcription matches the term, score their accuracy (0 to 100), " +
        "and provide highly actionable feedback on word stress, pronunciation, and intonation. " +
        "Make your feedback professional, encouraging, and clear.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `The user attempted to pronounce: "${term}". The speech-to-text transcript came back as: "${text}". Provide feedback.`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCorrect: {
                type: Type.BOOLEAN,
                description: "Whether the pronunciation is close enough to be considered correct.",
              },
              accuracyScore: {
                type: Type.INTEGER,
                description: "Accuracy score from 0 to 100 based on transcript match and articulation.",
              },
              feedback: {
                type: Type.STRING,
                description: "Detailed feedback on intonation, vowel sounds, syllables, word stress, and corrections.",
              },
            },
            required: ["isCorrect", "accuracyScore", "feedback"],
          },
        },
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/pronunciation-feedback:", error);
      res.status(500).json({
        isCorrect: false,
        accuracyScore: 50,
        feedback: "Could not evaluate pronunciation due to a system error. Please try again.",
      });
    }
  });

  // API Route: AI Ingestion / Parse Document
  app.post("/api/parse-document", async (req, res) => {
    try {
      const { fileName, fileContent } = req.body;

      const systemInstruction = 
        "You are an AI Document Ingestion agent for a high-end corporate knowledge base. " +
        "Your task is to analyze the uploaded document's name and text content, summarize it in 2 clear sentences, " +
        "and tag it with 1-3 highly relevant professional categories (such as Marketing, Strategy, Products, Legal, Customers, Sales, Operations, Technology). " +
        "Make sure the summary is professional, useful, and educational for a business English learner.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Document Name: "${fileName}"\n\nContent:\n${fileContent || "This document outlines strategic guidelines and parameters."}`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A refined, clean title for the document.",
              },
              fileType: {
                type: Type.STRING,
                description: "The parsed document type (e.g., PDF, Word Doc, Image).",
              },
              summary: {
                type: Type.STRING,
                description: "A professional 2-sentence summary of the main points.",
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "1 to 3 relevant domain tags.",
              },
            },
            required: ["title", "fileType", "summary", "tags"],
          },
        },
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/parse-document:", error);
      res.status(500).json({
        title: (req.body && req.body.fileName) || "Imported Document",
        fileType: "PDF",
        summary: "Document imported successfully. (Note: standard parsing fallback was used).",
        tags: ["General"],
      });
    }
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
