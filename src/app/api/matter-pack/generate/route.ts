import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { MatterPackDocument, type MatterPackData } from "@/lib/pdf/matter-pack-doc";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await request.json() as {
    sessionId?: string;
    workerName?: string;
    employer?: string;
    industry?: string;
    awardName?: string;
    employmentStartDate?: string;
    currentStatus?: string;
    account?: string;
    issuesSummary?: string;
    nextSteps?: string;
  };

  // Load profile if available
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, employer, industry")
    .eq("id", user.id)
    .single();

  // Load PEACE session if provided
  let account = body.account ?? "";
  let sessionId = body.sessionId ?? `manual-${Date.now()}`;

  if (body.sessionId) {
    const { data: session } = await supabase
      .from("peace_sessions")
      .select("messages, id")
      .eq("id", body.sessionId)
      .eq("user_id", user.id)
      .single();

    if (session) {
      sessionId = session.id as string;
      if (!account) {
        // Reconstruct account from messages — extract user messages only
        const messages = session.messages as Array<{ role: string; content: string }>;
        const userMessages = messages
          .filter((m) => m.role === "user")
          .map((m) => m.content)
          .join("\n\n");
        account = userMessages || "Account not yet recorded.";
      }
    }
  }

  const data: MatterPackData = {
    workerName: body.workerName ?? profile?.first_name ?? user.email ?? "Worker",
    employer: body.employer ?? profile?.employer ?? "Employer not specified",
    industry: body.industry ?? profile?.industry ?? "Industry not specified",
    awardName: body.awardName ?? "To be confirmed",
    employmentStartDate: body.employmentStartDate,
    currentStatus: body.currentStatus,
    account: account || "Account not yet recorded — please complete the PEACE interview.",
    issuesSummary: body.issuesSummary ?? "Issues to be identified through interview process.",
    nextSteps: body.nextSteps ?? `1. Review this document with a qualified Australian legal practitioner.\n2. Contact the Fair Work Ombudsman at fairwork.gov.au to discuss your options.\n3. Gather supporting documents: payslips, rosters, employment contract, any written communications with your employer.\n4. Note the 6-year limitation period — do not delay seeking advice.`,
    generatedAt: new Date().toISOString(),
    sessionId,
  };

  const element = createElement(MatterPackDocument, { data }) as unknown as ReactElement<DocumentProps>;
  const pdfBuffer = await renderToBuffer(element);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="matter-pack-${Date.now()}.pdf"`,
    },
  });
}
