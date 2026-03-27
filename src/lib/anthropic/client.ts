import Anthropic from "@anthropic-ai/sdk";

// Server-side only — never import this in client components
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODELS = {
  default: "claude-sonnet-4-6",
  fast: "claude-haiku-4-5-20251001",
  powerful: "claude-opus-4-6",
} as const;
