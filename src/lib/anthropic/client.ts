import Anthropic from "@anthropic-ai/sdk";

// Server-side only — never import this in client components

export function getAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Lazy singleton for convenience
let _client: Anthropic | null = null;
export function getClient(): Anthropic {
  if (!_client) _client = getAnthropicClient();
  return _client;
}

export const MODELS = {
  default: "claude-sonnet-4-6",
  fast: "claude-haiku-4-5-20251001",
  powerful: "claude-opus-4-6",
} as const;
