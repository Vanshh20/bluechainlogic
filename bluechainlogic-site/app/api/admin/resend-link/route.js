import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "../../../lib/supabase";
import { checkAdmin } from "../../../lib/auth";
import { sendOnboardingEmail } from "../../../lib/gmail";

export async function POST(request) {
  const authFail = checkAdmin(request);
  if (authFail) return authFail;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    /* Fetch existing client */
    const { data: client, error: fetchErr } = await supabase
      .from("onboarding_clients")
      .select("client_name, email")
      .eq("id", id)
      .single();

    if (fetchErr || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    /* Generate new token + expiry */
    const token = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const host = request.headers.get("host") || "bluechainlogic.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const onboardingLink = `${protocol}://${host}/onboard/${token}`;

    /* Update row with new token */
    const { error: updateErr } = await supabase
      .from("onboarding_clients")
      .update({ token, expires_at: expiresAt, status: "pending" })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    /* Resend email */
    let emailSent = false;
    try {
      await sendOnboardingEmail({ to: client.email, clientName: client.client_name, onboardingLink });
      emailSent = true;
    } catch (emailErr) {
      console.error("Resend email failed:", emailErr);
    }

    return NextResponse.json({ success: true, link: onboardingLink, emailSent });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
