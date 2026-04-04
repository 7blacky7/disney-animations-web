/**
 * ClaudeCLIProvider — Persistente Claude-Agenten via CLI Subprocess
 *
 * Für Dev/Test: Nutzt `claude` CLI mit OAuth (kein API-Key nötig).
 * NUR Haiku-Modell für Tests (Kontextverschwendung vermeiden).
 *
 * Kernprinzip (cc-agenten-persistenz Skill):
 * - ANTHROPIC_API_KEY aus env entfernen → erzwingt OAuth
 * - child_process.spawn mit --verbose --print
 * - Session-Management via In-Memory Map
 *
 * WICHTIG: Nur server-seitig verwenden (child_process)!
 */

import { spawn, type ChildProcess } from "child_process";
import { dbg } from "@/lib/debug";
import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
  AISession,
} from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODEL = "haiku"; // NUR Haiku für Dev/Test
const TOKEN_LIMIT = 200_000;
const TOKEN_WARNING = 180_000;
const DEFAULT_MAX_TOKENS = 4096;

// ---------------------------------------------------------------------------
// Session Storage
// ---------------------------------------------------------------------------

const sessions = new Map<string, AISession>();

// ---------------------------------------------------------------------------
// Helper: Clean env (remove API key to force OAuth)
// ---------------------------------------------------------------------------

function getCleanEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  return env;
}

// ---------------------------------------------------------------------------
// Helper: Build context from messages
// ---------------------------------------------------------------------------

function buildContext(messages: AIMessage[], maxMessages = 50): string {
  const recent = messages.slice(-maxMessages);
  return recent
    .map((m) => `${m.role === "user" ? "Human" : "Assistant"}: ${m.content}`)
    .join("\n\n");
}

// ---------------------------------------------------------------------------
// Helper: Run claude CLI
// ---------------------------------------------------------------------------

function runClaude(
  prompt: string,
  options: {
    systemPrompt?: string;
    maxTokens?: number;
    onChunk?: (chunk: string) => void;
    signal?: AbortSignal;
  } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "--verbose",
      "--print",
      "--model", MODEL,
      "--max-tokens", String(options.maxTokens ?? DEFAULT_MAX_TOKENS),
    ];

    if (options.systemPrompt) {
      args.push("--system-prompt", options.systemPrompt);
    }

    args.push(prompt);

    dbg.server("Claude CLI starten", { model: MODEL, promptLength: prompt.length });

    const child: ChildProcess = spawn("claude", args, {
      env: getCleanEnv(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";

    child.stdout?.on("data", (data: Buffer) => {
      const chunk = data.toString();
      output += chunk;
      options.onChunk?.(chunk);
    });

    child.stderr?.on("data", (data: Buffer) => {
      errorOutput += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        dbg.server("Claude CLI Antwort", { outputLength: output.length });
        resolve(output.trim());
      } else {
        dbg.server.error("Claude CLI Fehler", { code, error: errorOutput });
        reject(new Error(`Claude CLI exited with code ${code}: ${errorOutput}`));
      }
    });

    child.on("error", (err) => {
      dbg.server.error("Claude CLI Spawn-Fehler", { error: err.message });
      reject(err);
    });

    // Abort support
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        child.kill("SIGTERM");
        reject(new Error("Aborted"));
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Provider Implementation
// ---------------------------------------------------------------------------

export const claudeCLIProvider: AIProvider = {
  type: "claude-cli",
  name: "Claude CLI (Dev/Test)",

  async isAvailable(): Promise<boolean> {
    try {
      const child = spawn("claude", ["--version"], {
        env: getCleanEnv(),
        stdio: ["pipe", "pipe", "pipe"],
      });

      return new Promise((resolve) => {
        child.on("close", (code) => resolve(code === 0));
        child.on("error", () => resolve(false));
        setTimeout(() => {
          child.kill();
          resolve(false);
        }, 5000);
      });
    } catch {
      return false;
    }
  },

  async complete(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): Promise<AICompletionResult> {
    const start = Date.now();
    const context = buildContext(messages);
    const content = await runClaude(context, {
      systemPrompt: options?.systemPrompt,
      maxTokens: options?.maxTokens,
      onChunk: options?.onChunk,
      signal: options?.signal,
    });

    return {
      content,
      model: MODEL,
      durationMs: Date.now() - start,
    };
  },

  async *completeStream(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): AsyncIterable<string> {
    const context = buildContext(messages);
    const chunks: string[] = [];
    let resolveNext: ((value: IteratorResult<string>) => void) | null = null;
    let done = false;

    const promise = runClaude(context, {
      systemPrompt: options?.systemPrompt,
      maxTokens: options?.maxTokens,
      signal: options?.signal,
      onChunk: (chunk) => {
        if (resolveNext) {
          resolveNext({ value: chunk, done: false });
          resolveNext = null;
        } else {
          chunks.push(chunk);
        }
      },
    });

    promise.then(() => { done = true; }).catch(() => { done = true; });

    while (!done || chunks.length > 0) {
      if (chunks.length > 0) {
        yield chunks.shift()!;
      } else if (!done) {
        yield await new Promise<string>((resolve) => {
          resolveNext = (result) => resolve(result.value);
        });
      }
    }
  },

  async createSession(systemPrompt?: string): Promise<AISession> {
    const id = crypto.randomUUID();
    const session: AISession = {
      id,
      messages: systemPrompt
        ? [{ role: "system", content: systemPrompt, timestamp: new Date() }]
        : [],
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    sessions.set(id, session);
    dbg.server("Session erstellt", { sessionId: id });
    return session;
  },

  async sendMessage(
    sessionId: string,
    message: string,
    options?: AICompletionOptions,
  ): Promise<AICompletionResult> {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    const systemMsg = session.messages.find((m) => m.role === "system");
    const result = await this.complete(session.messages, {
      ...options,
      systemPrompt: options?.systemPrompt ?? systemMsg?.content,
    });

    session.messages.push({
      role: "assistant",
      content: result.content,
      timestamp: new Date(),
    });

    session.lastActivity = new Date();

    // Token warning
    const totalChars = session.messages.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedTokens = Math.round(totalChars / 4);
    if (estimatedTokens > TOKEN_WARNING) {
      dbg.server.warn("Token-Warnung", {
        sessionId,
        estimatedTokens,
        limit: TOKEN_LIMIT,
      });
    }

    return result;
  },

  async getSession(sessionId: string): Promise<AISession | null> {
    return sessions.get(sessionId) ?? null;
  },

  async endSession(sessionId: string): Promise<void> {
    sessions.delete(sessionId);
    dbg.server("Session beendet", { sessionId });
  },

  async dispose(): Promise<void> {
    sessions.clear();
    dbg.server("Alle Sessions beendet");
  },
};
