import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token || token.length < 8) {
    return NextResponse.json({ valid: false, reason: "invalid" });
  }

  try {
    const { data, error } = await supabase
      .from("onboarding_clients")
      .select("client_name, status, expires_at")
      .eq("token", token)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false, reason: "not_found" });
    }

    if (data.status === "completed") {
      return NextResponse.json({ valid: false, reason: "completed" });
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, reason: "expired" });
    }

    return NextResponse.json({ valid: true, clientName: data.client_name });
  } catch {
    return NextResponse.json({ valid: false, reason: "error" }, { status: 500 });
  }
}
