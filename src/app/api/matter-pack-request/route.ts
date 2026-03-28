import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MATTER_PACK_PAYMENT_LINK = "https://buy.stripe.com/test_eVq7sNb6ue4MeFndKRgjC00";

export async function POST(request: NextRequest) {
  try {
    const { name, email, employer, summary } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    // Save to Supabase
    const { error: dbError } = await supabase.from("matter_requests").insert({
      name,
      email,
      employer: employer || null,
      summary: summary || null,
      payment_link: MATTER_PACK_PAYMENT_LINK,
      status: "pending_payment",
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    // Email Mark via Resend (if key is configured)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Fair Work Help <notifications@fairworkhelp.app>",
          to: ["mark@ethicaltechnologies.ai"],
          subject: `New Matter Pack Request — ${name}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h2 style="color:#1B3A5C;margin-bottom:16px;">New Matter Pack Request</h2>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr><td style="padding:8px 0;color:#555;font-weight:600;width:120px;">Name</td><td style="padding:8px 0;">${name}</td></tr>
                <tr><td style="padding:8px 0;color:#555;font-weight:600;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#1B3A5C;">${email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#555;font-weight:600;">Employer</td><td style="padding:8px 0;">${employer || "—"}</td></tr>
                <tr><td style="padding:8px 0;color:#555;font-weight:600;vertical-align:top;">Summary</td><td style="padding:8px 0;">${summary || "—"}</td></tr>
              </table>
              <div style="background:#f5f0e8;border-left:4px solid #C9A84C;padding:16px;border-radius:4px;">
                <p style="margin:0 0 8px;font-weight:600;color:#1B3A5C;">Payment link sent to user:</p>
                <a href="${MATTER_PACK_PAYMENT_LINK}" style="color:#1B3A5C;word-break:break-all;">${MATTER_PACK_PAYMENT_LINK}</a>
              </div>
              <p style="margin-top:24px;color:#999;font-size:12px;">Fair Work Help · fairworkhelp.app</p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true, paymentLink: MATTER_PACK_PAYMENT_LINK });
  } catch (error) {
    console.error("Matter pack request error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
