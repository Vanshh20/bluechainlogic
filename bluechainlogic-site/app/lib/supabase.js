import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase env vars missing — DB calls will fail");
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");
