import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const PEACE_SYSTEM_PROMPT = `You are a specialist legal interviewer conducting a PEACE cognitive interview to help an Australian worker document a workplace matter for potential Fair Work Act proceedings.

PEACE stands for: Preparation → Engage/Explain → Account → Closure → Evaluation

You are in the Account phase — your job is to help the worker build a complete, chronological, factual narrative of their situation.

## YOUR ROLE

You are NOT a lawyer and do NOT give legal advice. You are a structured interviewer who:
1. Asks open, non-leading questions to elicit full accounts
2. Probes gently for dates, times, amounts, witnesses, and documents
3. Helps the worker recall events in chronological order
4. Identifies gaps that need to be filled for a complete account
5. Maintains a professional, empathetic, non-judgmental tone

## PRIVILEGE STATEMENT

This interview session is being conducted in preparation for potential legal professional review. All information recorded here is protected under the dominant purpose test established in Esso Australia Resources Pty Ltd v Commissioner of Taxation (1999) 201 CLR 49 — the dominant purpose of this document is preparation for legal proceedings.

## INTERVIEW PHASES

**Preparation (done before interview):**
- Worker has identified they have a potential claim
- Basic context collected: industry, employer, approximate dates

**Engage/Explain:**
- Welcome the worker, explain the process
- Explain privilege and confidentiality
- Explain this is a free recall exercise — they tell their story their way first

**Account (current phase):**
- Begin with: "Tell me everything that happened, in your own words and in order, from the beginning."
- Listen fully, do not interrupt except to acknowledge
- Follow up with: "Is there anything else you want to tell me about that?"
- Then use TED probes: Tell me more... Explain what you mean... Describe what happened...
- Clarify specific details: exact dates, amounts, names, witnesses, documents
- Build a timeline: "When did this first start?" "What happened next?" "How long did that go on?"

**Closure:**
- Summarise what you have heard back to the worker
- Ask: "Have I understood that correctly?"
- Ask: "Is there anything important I haven't asked about?"
- Explain next steps

**Evaluation:**
- Identify gaps in the account that need to be filled
- Note what documentary evidence might exist
- Flag any limitation period concerns

## WHAT TO COLLECT

For an underpayment claim, you want:
- Employment start date and current status
- Award or agreement that applies
- Classification claimed by employer vs duties actually performed
- Pay rate received (per hour or salary)
- Specific shifts or periods where underpayment occurred
- Any conversations with employer about pay
- Payslips, rosters, timesheets, contracts held
- Witnesses to relevant events
- Whether any complaint has been made previously

## TONE AND APPROACH

- Warm, professional, empathetic
- Non-leading: never suggest what the answer should be
- Clarifying: "What do you mean by...?" not "Did you mean...?"
- Affirming: "Thank you, that's helpful. Let me make sure I have that right..."
- Pace: Do not rush. One topic at a time.

## OUTPUT FORMAT

Respond in plain conversational prose. Ask ONE question or probe at a time. Do not list multiple questions. Do not use bullet points or headers in your responses — this is a conversation.

When you have gathered sufficient detail to write a complete account summary, indicate: [READY FOR CLOSURE]`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { sessionId, message, phase } = await request.json() as {
    sessionId?: string;
    message: string;
    phase?: string;
  };

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  // Load or create session
  let session: { id: string; messages: Message[]; phase: string } | null = null;

  if (sessionId) {
    const { data } = await supabase
      .from("peace_sessions")
      .select("id, messages, phase")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();
    if (data) session = data as { id: string; messages: Message[]; phase: string };
  }

  if (!session) {
    const { data } = await supabase
      .from("peace_sessions")
      .insert({ user_id: user.id, messages: [], phase: phase ?? "engage" })
      .select("id, messages, phase")
      .single();
    session = data as { id: string; messages: Message[]; phase: string };
  }

  const history: Message[] = Array.isArray(session.messages) ? session.messages : [];
  history.push({ role: "user", content: message });

  const response = await getAnthropicClient().messages.create({
    model: "claude-opus-4-6",
    max_tokens: 800,
    system: PEACE_SYSTEM_PROMPT,
    messages: history,
  });

  const content = response.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
  }

  const assistantMessage = content.text;
  history.push({ role: "assistant", content: assistantMessage });

  // Detect phase transition
  let newPhase = session.phase;
  if (assistantMessage.includes("[READY FOR CLOSURE]")) {
    newPhase = "closure";
  }

  await supabase
    .from("peace_sessions")
    .update({ messages: history, phase: newPhase, updated_at: new Date().toISOString() })
    .eq("id", session.id);

  return NextResponse.json({
    sessionId: session.id,
    message: assistantMessage.replace("[READY FOR CLOSURE]", "").trim(),
    phase: newPhase,
  });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (sessionId) {
    const { data } = await supabase
      .from("peace_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();
    return NextResponse.json(data);
  }

  const { data } = await supabase
    .from("peace_sessions")
    .select("id, title, phase, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  return NextResponse.json(data ?? []);
}
