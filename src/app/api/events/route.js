import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);

export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const domain = p.get("domain");
  const minSev = p.get("min_severity");
  const esc = p.get("escalation");
  const search = p.get("search");
  const limit = parseInt(p.get("limit") || "80");
  const offset = parseInt(p.get("offset") || "0");

  let q = sb
    .from("events")
    .select("*", { count: "exact" })
    .order("event_datetime_utc", { ascending: false })
    .range(offset, offset + limit - 1);

  if (domain) q = q.eq("domain", domain);
  if (minSev) q = q.gte("severity_score", parseFloat(minSev));
  if (esc === "true") q = q.eq("is_escalation_signal", true);
  if (search) q = q.ilike("claim_text", `%${search}%`);

  const { data, error, count } = await q;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data || [], total: count });
}
