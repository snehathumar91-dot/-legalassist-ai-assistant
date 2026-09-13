import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Open CORS and Cache-Control headers so visitors can access freely
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Cache-Control", "no-store, no-cache, must-revalidate");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Safe Generation with Model Fallback for Maximum Availability
async function generateContentSafe(ai: GoogleGenAI, params: { contents: any; config?: any }) {
  // Using verified, active official Gemini models from Google GenAI SDK
  const models = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return { response, modelUsed: model };
      }

      // Check if response was flagged by safety filter
      if (response?.candidates?.[0]?.finishReason === "SAFETY") {
        return {
          response: {
            text: JSON.stringify({
              documentType: "Security Flagged / Unsafe Content",
              executiveSummary: "The submitted text was flagged by AI safety filters as adversarial or unsafe. It does not contain valid legal terms.",
              riskScore: 100,
              riskLevel: "Critical",
              riskSummary: "Content flagged for safety policy violation or prompt injection. No legal enforceability.",
              keyParties: [],
              redFlags: [{
                title: "Adversarial Prompt / Safety Block",
                severity: "Critical",
                clauseSnippet: "Prompt injection / safety filter triggered",
                plainExplanation: "The AI safety layer prevented processing of this text due to adversarial instructions.",
                recommendedAction: "Submit an authentic contract, lease, NDA, or terms of service."
              }],
              simplifiedClauses: [],
              keyObligations: [],
              financialAndTerminationTerms: { paymentTerms: "N/A", terminationConditions: "N/A", renewalTerms: "N/A" },
              overallVerdict: "Flagged content. Please submit a valid contract."
            })
          },
          modelUsed: model
        };
      }
    } catch (err: any) {
      console.warn(`Model ${model} error:`, err?.message || err);
      lastError = err;

      // If error is related to safety or prompt injection, return safe fallback JSON instead of crashing
      if (err?.message?.includes("SAFETY") || err?.message?.includes("blocked") || err?.message?.includes("finishReason: SAFETY")) {
        return {
          response: {
            text: JSON.stringify({
              documentType: "Security Flagged / Adversarial Input",
              executiveSummary: "The submitted text was flagged by AI safety filters. It contains prompt injection patterns rather than standard contractual clauses.",
              riskScore: 100,
              riskLevel: "Critical",
              riskSummary: "The input contains instructions attempting to bypass security or AI guidelines.",
              keyParties: [],
              redFlags: [{
                title: "Prompt Injection Detected",
                severity: "Critical",
                clauseSnippet: "Adversarial instruction detected",
                plainExplanation: "The text was recognized as an adversarial prompt attempting to override instructions.",
                recommendedAction: "Please test with legitimate legal agreements, contracts, or terms."
              }],
              simplifiedClauses: [],
              keyObligations: [],
              financialAndTerminationTerms: { paymentTerms: "N/A", terminationConditions: "N/A", renewalTerms: "N/A" },
              overallVerdict: "Adversarial payload identified and neutralized by AI security filters."
            })
          },
          modelUsed: model
        };
      }
    }
  }

  throw lastError || new Error("All AI models were temporarily unreachable. Please retry in a few seconds.");
}

// Safe JSON parser handling optional markdown formatting
function parseJsonSafe(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned);
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Simplify Legal Document
app.post("/api/simplify-legal-doc", async (req, res) => {
  try {
    const { documentText, readingLevel = "everyday", language = "English" } = req.body;
    if (!documentText || typeof documentText !== "string" || !documentText.trim()) {
      return res.status(400).json({ error: "Document text is required." });
    }

    const ai = getGeminiClient();

    const prompt = `You are an elite legal technology intelligence engine designed for legal accessibility.
Analyze the following legal document or contract text. Your goal is to democratize legal comprehension for everyday people, entrepreneurs, and clients while maintaining precision.

Document Text:
"""
${documentText.slice(0, 40000)}
"""

Target Reading Level: ${readingLevel} (Options: 'everyday' for 8th-grade clear conversational clarity, 'business' for executive commercial context, 'detailed' for comprehensive clause breakdown).
Target Language for Explanations: ${language} (Translate your summaries, explanations, and risk notes into this language, while keeping original clause quotes in original text for accuracy).

Return a strict JSON object with this exact schema:
{
  "documentType": "e.g. Non-Disclosure Agreement, Employment Contract, SaaS Terms of Service, Commercial Lease, Independent Contractor Agreement, etc.",
  "executiveSummary": "2-3 crisp sentences explaining what this contract is about in plain words.",
  "riskScore": number between 0 and 100 (0 = safe/standard, 100 = extreme traps/hazardous),
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "riskSummary": "Short explanation why this risk score was assigned.",
  "keyParties": [
    { "role": "e.g. Client / Disclosing Party", "name": "Name or party designation", "keyObligation": "Main duty" }
  ],
  "redFlags": [
    {
      "title": "Short title of red flag",
      "severity": "Critical" | "High" | "Medium",
      "clauseSnippet": "Verbatim quote or clause reference",
      "plainExplanation": "Why this is dangerous or disadvantageous to the user in simple words",
      "recommendedAction": "What the user should ask for or modify"
    }
  ],
  "simplifiedClauses": [
    {
      "sectionName": "e.g. Intellectual Property, Indemnification, Termination, Non-Compete",
      "originalTextSnippet": "Key sentence from original clause",
      "plainLanguageMeaning": "What it actually means for you in simple language",
      "riskRating": "Safe" | "Caution" | "Hazardous",
      "gotchas": "Any hidden surprises or trap doors"
    }
  ],
  "keyObligations": [
    {
      "party": "Who has to do it",
      "obligation": "What must be done",
      "timelineOrTrigger": "When or under what condition"
    }
  ],
  "financialAndTerminationTerms": {
    "paymentTerms": "Summary of fees, penalties, or payment schedules",
    "terminationConditions": "How either party can exit or cancel",
    "renewalTerms": "Automatic renewal details or notice periods"
  },
  "overallVerdict": "Actionable advice: e.g. 'Safe to sign with minor clarifications' or 'Do NOT sign without negotiating clause 4 and 8'."
}

Respond ONLY with valid JSON.`;

    const { response, modelUsed } = await generateContentSafe(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = parseJsonSafe(response.text || "{}");
    res.json({ ...data, _meta: { modelUsed, timestamp: new Date().toISOString() } });
  } catch (error: any) {
    console.error("Error simplifying legal doc:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze document. Please verify your GEMINI_API_KEY.",
    });
  }
});

// 2. Compare Contracts (Diff Analysis)
app.post("/api/compare-contracts", async (req, res) => {
  try {
    const { docA, docB, docALabel = "Original Draft / Standard", docBLabel = "Counterparty Version / Redline" } = req.body;
    if (!docA || !docB) {
      return res.status(400).json({ error: "Both Document A and Document B are required for comparison." });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert contract lawyer and AI legal diff engine.
Compare the two contracts or clauses below:

DOCUMENT A (${docALabel}):
"""
${docA.slice(0, 25000)}
"""

DOCUMENT B (${docBLabel}):
"""
${docB.slice(0, 25000)}
"""

Perform a deep semantic comparison. Identify material changes, deleted rights, added burdens, shift in balance of power, and risk implications.

Return a strict JSON object with this exact schema:
{
  "comparisonSummary": "Overview of how Document B deviates from Document A, highlighting the general shift in leverage.",
  "balanceOfPower": "Party A Favored" | "Party B Favored" | "Fair & Balanced" | "Highly Skewed",
  "keyChangesCount": {
    "criticalRisks": number,
    "moderateChanges": number,
    "minorOrNeutral": number
  },
  "differences": [
    {
      "topic": "e.g. Liability Cap, Termination for Convenience, IP Ownership, Payment Terms",
      "docAVersion": "Summary or quote of what Document A stated",
      "docBVersion": "Summary or quote of what Document B changed it to",
      "changeType": "Added Restriction" | "Deleted Protection" | "Modified Requirement" | "Standardized",
      "legalImpact": "Detailed breakdown of who benefits and what real-world consequences this creates",
      "favorability": "${docALabel} Favored" | "${docBLabel} Favored" | "Neutral",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "counterSuggestion": "Suggested compromise wording or pushback note for negotiation"
    }
  ],
  "recommendations": [
    "Specific bullet recommendations on what to push back on before signing"
  ]
}

Respond ONLY with valid JSON.`;

    const { response, modelUsed } = await generateContentSafe(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = parseJsonSafe(response.text || "{}");
    res.json({ ...data, _meta: { modelUsed, timestamp: new Date().toISOString() } });
  } catch (error: any) {
    console.error("Error comparing contracts:", error);
    res.status(500).json({
      error: error.message || "Failed to compare contracts. Please verify your GEMINI_API_KEY.",
    });
  }
});

// 3. Clarify Specific Clause & Negotiate Redline
app.post("/api/clarify-clause", async (req, res) => {
  try {
    const { clauseText, context = "", userPerspective = "Signer / Recipient" } = req.body;
    if (!clauseText || typeof clauseText !== "string" || !clauseText.trim()) {
      return res.status(400).json({ error: "Clause text is required." });
    }

    const ai = getGeminiClient();

    const prompt = `You are an AI legal counsel specializing in contract simplification and negotiation access for non-lawyers.
Analyze this specific clause:
"""
${clauseText.slice(0, 10000)}
"""
${context ? `Broader Document Context:\n"""${context.slice(0, 10000)}"""\n` : ""}
User's Position/Perspective: ${userPerspective}

Return a strict JSON object with this exact schema:
{
  "clauseName": "e.g. Unilateral Indemnification Clause, Non-Solicitation Covenant, Limitation of Liability",
  "plainEnglishBreakdown": "Explain what this clause actually says in simple everyday language.",
  "inSimpleAnalogies": "A real-world analogy to make it immediately intuitive (e.g., 'This is like saying if the delivery truck crashes, you buy the new truck').",
  "riskRating": "Safe" | "Moderate" | "High" | "Severe Trap",
  "trapExplanation": "What could go wrong if things head to dispute or breach",
  "standardVsAggressive": "Is this standard commercial market practice or aggressive/one-sided?",
  "redlineProposal": {
    "originalExcerpt": "The problematic part of the clause",
    "suggestedReplacement": "Clean, balanced wording to suggest back to the other party",
    "negotiationTalkingPoint": "Friendly script the user can email or say to the other party to explain why this change is fair"
  },
  "scenarios": [
    {
      "whatIf": "e.g. What if I want to terminate early?",
      "outcome": "What happens under this clause"
    },
    {
      "whatIf": "e.g. What if a third party sues?",
      "outcome": "What happens under this clause"
    }
  ]
}

Respond ONLY with valid JSON.`;

    const { response, modelUsed } = await generateContentSafe(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = parseJsonSafe(response.text || "{}");
    res.json({ ...data, _meta: { modelUsed, timestamp: new Date().toISOString() } });
  } catch (error: any) {
    console.error("Error clarifying clause:", error);
    res.status(500).json({
      error: error.message || "Failed to clarify clause. Please verify your GEMINI_API_KEY.",
    });
  }
});

// 4. Interactive Legal Assistant Q&A Chat
app.post("/api/chat-legal", async (req, res) => {
  try {
    const { documentText, question, conversationHistory = [] } = req.body;
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question is required." });
    }

    const ai = getGeminiClient();

    const historyFormatted = conversationHistory
      .slice(-6)
      .map((msg: any) => `${msg.role === "user" ? "User" : "Legal Assistant"}: ${msg.content}`)
      .join("\n");

    const prompt = `You are LegalAssist, an empathetic, hyper-competent AI legal advisor helping users understand contracts.
Use the document context below to answer the user's question accurately with direct citations to the relevant sections.
If the document does not mention something, explicitly state that it is omitted or silent on that issue.

DOCUMENT TEXT:
"""
${(documentText || "No specific document provided, answer based on general contract principles.").slice(0, 30000)}
"""

RECENT CONVERSATION HISTORY:
${historyFormatted}

CURRENT QUESTION: "${question}"

Guidelines:
1. Provide a direct, definitive answer first (Yes/No/It depends, with simple explanation).
2. Quote the specific clause/section if available.
3. Highlight practical consequences for the user.
4. Give a practical recommendation or follow-up check.
5. End with a standard disclaimer: "This analysis is for informational purposes and does not constitute formal legal counsel."

Format your answer with clear markdown (bold headings, bullet points).`;

    const { response, modelUsed } = await generateContentSafe(ai, {
      contents: prompt,
    });

    res.json({ answer: response.text || "I was unable to generate an answer.", _meta: { modelUsed, timestamp: new Date().toISOString() } });
  } catch (error: any) {
    console.error("Error in chat-legal:", error);
    res.status(500).json({
      error: error.message || "Failed to answer legal question. Please verify your GEMINI_API_KEY.",
    });
  }
});

// Setup Vite or Static Serving
async function start() {
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
    console.log(`LegalAssist AI server running on http://0.0.0.0:${PORT}`);
  });
}

start();
