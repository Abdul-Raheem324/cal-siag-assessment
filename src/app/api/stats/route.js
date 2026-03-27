import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);

export async function GET() {
  const since = new Date(Date.now() - 14 * 86400000).toISOString();

  const [allRes, escRes, timelineRes] = await Promise.all([
    sb
      .from("events")
      .select("severity_score,confidence_score,domain,event_type", {
        count: "exact",
      }),
    sb
      .from("events")
      .select("id", { count: "exact" })
      .eq("is_escalation_signal", true),
    sb
      .from("events")
      .select("event_datetime_utc,severity_score,is_escalation_signal")
      .gte("event_datetime_utc", since)
      .order("event_datetime_utc", { ascending: true }),
  ]);

  const rows = allRes.data || [];
  const totalEvents = allRes.count || 0;
  const escalationCount = escRes.count || 0;
  const avgSeverity = rows.length
    ? +(
        rows.reduce((s, e) => s + (e.severity_score || 0), 0) / rows.length
      ).toFixed(1)
    : 0;
  const avgConfidence = rows.length
    ? +(
        rows.reduce((s, e) => s + (e.confidence_score || 0), 0) / rows.length
      ).toFixed(1)
    : 0;

  const domainCounts = {};
  const typeCounts = {};
  rows.forEach(({ domain, event_type }) => {
    if (domain) domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    if (event_type) typeCounts[event_type] = (typeCounts[event_type] || 0) + 1;
  });

  const daily = {};
  (timelineRes.data || []).forEach((e) => {
    const d = e.event_datetime_utc?.slice(0, 10);
    if (!d) return;
    if (!daily[d])
      daily[d] = { date: d, count: 0, totalSev: 0, escalations: 0 };
    daily[d].count++;
    daily[d].totalSev += e.severity_score || 0;
    if (e.is_escalation_signal) daily[d].escalations++;
  });
  const timeline = Object.values(daily).map((d) => ({
    date: d.date,
    count: d.count,
    avgSeverity: d.count ? +(d.totalSev / d.count).toFixed(1) : 0,
    escalations: d.escalations,
  }));

  const recent3AvgSev =
    timeline.slice(-3).reduce((s, d) => s + d.avgSeverity, 0) /
    Math.max(timeline.slice(-3).length, 1);
  const threatLevel =
    recent3AvgSev >= 8 || escalationCount > 10
      ? "CRITICAL"
      : recent3AvgSev >= 6 || escalationCount > 5
        ? "HIGH"
        : recent3AvgSev >= 4
          ? "ELEVATED"
          : "LOW";

  return NextResponse.json({
    totalEvents,
    escalationCount,
    avgSeverity,
    avgConfidence,
    domainCounts,
    typeCounts,
    timeline,
    threatLevel,
  });
}
