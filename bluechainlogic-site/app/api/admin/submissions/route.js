import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { checkAdmin } from "../../../lib/auth";

export async function GET(request) {
  const authFail = checkAdmin(request);
  if (authFail) return authFail;

  try {
    const { data, error } = await supabase
      .from("onboarding_clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    return NextResponse.json({ clients: data });
  } catch (err) {
    console.error("Submissions fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
