/**
 * AI Provider Registry — Zentraler Zugriffspunkt für KI-Integration
 *
 * Wählt den richtigen Provider basierend auf Tenant-Config.
 * Dev/Test: ClaudeCLIProvider (Haiku)
 * Prod: ClaudeAPIProvider / OpenAIProvider (TODO: implementieren)
 */

export type { AIProvider, AIProviderConfig, AIMessage, AICompletionOptions, AICompletionResult, AISession, AIProviderType, AIModel } from "./types";

import type { AIProvider, AIProviderType } from "./types";

// Provider-Registry (lazy loaded)
const providers = new Map<AIProviderType, () => Promise<AIProvider>>();

// Register built-in providers
providers.set("claude-cli", async () => {
  const { claudeCLIProvider } = await import("./claude-cli-provider");
  return claudeCLIProvider;
});

// TODO: Claude API Provider (Production)
// providers.set("claude-api", async () => {
//   const { claudeAPIProvider } = await import("./claude-api-provider");
//   return claudeAPIProvider;
// });

// TODO: OpenAI Provider (Production)
// providers.set("openai", async () => {
//   const { openAIProvider } = await import("./openai-provider");
//   return openAIProvider;
// });

/**
 * Get an AI provider by type.
 * Lazy-loads the provider module on first access.
 */
export async function getAIProvider(type: AIProviderType): Promise<AIProvider> {
  const factory = providers.get(type);
  if (!factory) {
    throw new Error(`AI Provider "${type}" ist nicht registriert. Verfügbar: ${Array.from(providers.keys()).join(", ")}`);
  }
  return factory();
}

/**
 * Get the default AI provider based on environment.
 * Dev: claude-cli, Prod: claude-api
 */
export async function getDefaultProvider(): Promise<AIProvider> {
  const isDev = process.env.NODE_ENV === "development";
  return getAIProvider(isDev ? "claude-cli" : "claude-cli"); // TODO: claude-api for prod
}

/**
 * List all registered provider types.
 */
export function listProviders(): AIProviderType[] {
  return Array.from(providers.keys());
}
