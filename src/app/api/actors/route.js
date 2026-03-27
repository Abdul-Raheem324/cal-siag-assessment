import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);
export async function GET() {
  const { data, error } = await sb
    .from("actors")
    .select("*")
    .order("event_count", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ actors: data || [] });
}
