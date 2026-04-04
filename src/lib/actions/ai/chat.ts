"use server";

import { requireAuth } from "@/lib/auth/session";
import { getAIProvider } from "@/lib/ai";
import { dbg } from "@/lib/debug";
import type { AIProviderType } from "@/lib/ai/types";

/**
 * AI-Tutor Chat — Server Action für Quiz-Hilfe
 *
 * Nutzt den konfigurierten AI Provider (ClaudeCLI für Dev/Test).
 * System-Prompt enthält Quiz-Kontext (Frage, Thema, Schwierigkeit).
 *
 * SECURITY: Nur authentifizierte User, nur wenn Tenant ai_enabled=true.
 */

interface ChatInput {
  message: string;
  /** Current question text for context */
  questionContext?: string;
  /** Quiz title for context */
  quizTitle?: string;
  /** Programming language (for code questions) */
  programmingLanguage?: string;
  /** Session ID for multi-turn conversations */
  sessionId?: string;
}

interface ChatResult {
  response: string;
  sessionId: string;
  durationMs: number;
}

function buildSystemPrompt(input: ChatInput): string {
  let prompt = `Du bist ein freundlicher Programmier-Tutor auf einer Lernplattform.
Deine Aufgabe: Hilf dem Lernenden bei der aktuellen Aufgabe, ohne die Lösung direkt zu verraten.
Gib Hinweise, erkläre Konzepte, stelle Gegenfragen.
Antworte auf Deutsch, kurz und präzise (max 3-4 Sätze).
Verwende Markdown für Code-Blöcke.`;

  if (input.quizTitle) {
    prompt += `\n\nAktuelles Quiz: "${input.quizTitle}"`;
  }
  if (input.questionContext) {
    prompt += `\nAktuelle Frage: "${input.questionContext}"`;
  }
  if (input.programmingLanguage) {
    prompt += `\nProgrammiersprache: ${input.programmingLanguage}`;
  }

  prompt += `\n\nWICHTIG: Verrate NIEMALS die direkte Lösung. Hilf durch Hinweise und Erklärungen.`;

  return prompt;
}

// In-memory session tracking (maps user sessions to AI sessions)
const userSessions = new Map<string, string>();

export async function sendTutorMessage(input: ChatInput): Promise<ChatResult> {
  const session = await requireAuth();
  const userId = session.user.id;

  dbg.server("AI-Tutor Nachricht", {
    userId,
    questionContext: input.questionContext?.slice(0, 50),
    hasSession: !!input.sessionId,
  });

  // Get AI provider (ClaudeCLI for dev)
  const providerType: AIProviderType = "claude-cli";
  const provider = await getAIProvider(providerType);

  // Check availability
  const available = await provider.isAvailable();
  if (!available) {
    dbg.server.warn("AI Provider nicht verfügbar", { providerType });
    return {
      response: "Der KI-Tutor ist aktuell nicht verfügbar. Bitte versuche es später erneut.",
      sessionId: input.sessionId ?? "",
      durationMs: 0,
    };
  }

  // Get or create session
  let aiSessionId = input.sessionId
    ? userSessions.get(`${userId}:${input.sessionId}`)
    : undefined;

  if (!aiSessionId) {
    const systemPrompt = buildSystemPrompt(input);
    const aiSession = await provider.createSession(systemPrompt);
    aiSessionId = aiSession.id;
    const userSessionKey = `${userId}:${aiSessionId}`;
    userSessions.set(userSessionKey, aiSessionId);
  }

  // Send message
  const start = Date.now();
  const result = await provider.sendMessage(aiSessionId, input.message);

  dbg.server("AI-Tutor Antwort", {
    userId,
    sessionId: aiSessionId,
    durationMs: result.durationMs,
    responseLength: result.content.length,
  });

  return {
    response: result.content,
    sessionId: aiSessionId,
    durationMs: result.durationMs,
  };
}
