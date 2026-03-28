import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODELS } from "../../../lib/anthropic/client";

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array required" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: model || MODELS.default,
      max_tokens: 4096,
      system: systemPrompt || "You are a legal education companion.",
      messages,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({
      content: content.text,
      usage: response.usage,
      model: response.model,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
