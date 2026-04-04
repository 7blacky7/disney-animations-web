/**
 * AI Provider Types — Abstraktes Interface für KI-Integration
 *
 * Architektur-Entscheidung: Provider-Pattern
 * - Dev/Test: ClaudeCLIProvider (persistente CC-Agenten, NUR Haiku)
 * - Prod: ClaudeAPIProvider / OpenAIProvider (API-Key basiert)
 *
 * REGEL: Test-Agenten NUR Haiku-Modell. Kein Opus, kein Sonnet.
 */

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

export type AIProviderType = "claude-cli" | "claude-api" | "openai";

export type AIModel =
  | "haiku"           // Claude Haiku — Dev/Test ONLY
  | "sonnet"          // Claude Sonnet
  | "opus"            // Claude Opus
  | "gpt-4o"          // OpenAI GPT-4o
  | "gpt-4o-mini";    // OpenAI GPT-4o Mini

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface AICompletionOptions {
  /** System prompt for the AI */
  systemPrompt?: string;
  /** Max tokens in response */
  maxTokens?: number;
  /** Temperature (0-1) */
  temperature?: number;
  /** Streaming callback for partial responses */
  onChunk?: (chunk: string) => void;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

export interface AICompletionResult {
  content: string;
  model: string;
  /** Token usage (if available from provider) */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Time taken in ms */
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Session Types (for persistent agents)
// ---------------------------------------------------------------------------

export interface AISession {
  id: string;
  messages: AIMessage[];
  createdAt: Date;
  lastActivity: Date;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Provider Interface
// ---------------------------------------------------------------------------

export interface AIProvider {
  /** Provider identifier */
  readonly type: AIProviderType;

  /** Display name */
  readonly name: string;

  /** Check if the provider is configured and ready */
  isAvailable(): Promise<boolean>;

  /** Generate a completion (single turn) */
  complete(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): Promise<AICompletionResult>;

  /** Generate a streaming completion */
  completeStream(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): AsyncIterable<string>;

  /** Create a persistent session (for multi-turn conversations) */
  createSession(systemPrompt?: string): Promise<AISession>;

  /** Send a message in an existing session */
  sendMessage(
    sessionId: string,
    message: string,
    options?: AICompletionOptions,
  ): Promise<AICompletionResult>;

  /** Get session history */
  getSession(sessionId: string): Promise<AISession | null>;

  /** End a session and clean up resources */
  endSession(sessionId: string): Promise<void>;

  /** Clean up all resources (on shutdown) */
  dispose(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Provider Config (Tenant-Level)
// ---------------------------------------------------------------------------

export interface AIProviderConfig {
  /** Is AI enabled for this tenant? */
  enabled: boolean;
  /** Which provider to use */
  provider: AIProviderType;
  /** API key (encrypted, for claude-api/openai) */
  apiKey?: string;
  /** Model override (default: haiku for dev, sonnet for prod) */
  model?: AIModel;
  /** Max tokens per request */
  maxTokens?: number;
}
