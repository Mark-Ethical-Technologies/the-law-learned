import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, sector } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // If Supabase is configured, save to database
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error } = await supabase.from("waitlist").insert([
        {
          email: email.toLowerCase().trim(),
          sector: sector || null,
          source: "fairworkhelp.app",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        // Duplicate email — return success silently
        if (error.code === "23505") {
          return NextResponse.json(
            { success: true, message: "You're on the list!" },
            { status: 200 }
          );
        }
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to save. Please try again." },
          { status: 500 }
        );
      }
    } else {
      // No Supabase configured — log in dev
      console.log("Waitlist signup (no DB configured):", {
        email,
        sector,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { success: true, message: "You're on the list!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
