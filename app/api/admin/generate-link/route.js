import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "../../../lib/supabase";
import { checkAdmin } from "../../../lib/auth";
import { sendOnboardingEmail } from "../../../lib/gmail";

export async function POST(request) {
  const authFail = checkAdmin(request);
  if (authFail) return authFail;

  try {
    const { clientName, email } = await request.json();

    if (!clientName || !email) {
      return NextResponse.json({ error: "Client name and email are required" }, { status: 400 });
    }

    const token = randomBytes(16).toString("hex"); // 32-char secure token
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days

    /* Determine the base URL from the request */
    const host = request.headers.get("host") || "bluechainlogic.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const onboardingLink = `${protocol}://${host}/onboard/${token}`;

    /* Insert into Supabase */
    const { data, error } = await supabase
      .from("onboarding_clients")
      .insert({
        client_name: clientName,
        email,
        token,
        status: "pending",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
    }

    /* Send onboarding email */
    let emailSent = false;
    try {
      await sendOnboardingEmail({ to: email, clientName, onboardingLink });
      emailSent = true;
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      link: onboardingLink,
      token,
      expiresAt,
      emailSent,
      id: data.id,
    });
  } catch (err) {
    console.error("Generate link error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
