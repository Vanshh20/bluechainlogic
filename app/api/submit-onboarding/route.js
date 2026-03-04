import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import { sendNotificationEmail } from "../../lib/gmail";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, timeline, emailAccounts, senders, photos, company, credentials } = body;

    if (!token || token.length < 8) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 400 });
    }

    /* Verify token is valid before accepting submission */
    const { data: client, error: fetchErr } = await supabase
      .from("onboarding_clients")
      .select("id, client_name, email, status, expires_at")
      .eq("token", token)
      .single();

    if (fetchErr || !client) {
      return NextResponse.json({ success: false, error: "Token not found" }, { status: 404 });
    }
    if (client.status === "completed") {
      return NextResponse.json({ success: false, error: "Already submitted" }, { status: 409 });
    }
    if (new Date(client.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "Token expired" }, { status: 410 });
    }

    /* Update the row with form data */
    const { error: updateErr } = await supabase
      .from("onboarding_clients")
      .update({
        status: "completed",
        submitted_at: new Date().toISOString(),
        timeline,
        email_accounts: emailAccounts || null,
        senders: JSON.stringify(senders),
        photos: JSON.stringify(photos),
        company_name: company?.name || null,
        company_website: company?.website || null,
        elevator_pitch: company?.elevatorPitch || null,
        icp: company?.icp || null,
        crm_used: company?.crmUsed || null,
        calendar_link: company?.calendarLink || null,
        additional_notes: company?.additionalNotes || null,
        vayne_email: credentials?.vayne?.email || null,
        vayne_password: credentials?.vayne?.password || null,
        anymailfinder_email: credentials?.anymailfinder?.email || null,
        anymailfinder_password: credentials?.anymailfinder?.password || null,
      })
      .eq("id", client.id);

    if (updateErr) {
      console.error("Supabase update error:", updateErr);
      return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
    }

    /* Send notification email (non-blocking — don't fail submission if email fails) */
    try {
      await sendNotificationEmail({
        clientName: client.client_name,
        companyName: company?.name,
        email: client.email,
      });
    } catch (emailErr) {
      console.error("Notification email failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
