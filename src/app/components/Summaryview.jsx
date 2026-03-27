"use client";
import { useMemo } from "react";

function timeAgo(iso) {
  if (!iso) return "—";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function sevColor(s) {
  if (s >= 8) return "#ff5370";
  if (s >= 6) return "#ffaa3b";
  if (s >= 4) return "#ffd166";
  return "#2ecc8e";
}

function sevLabel(s) {
  if (s >= 8) return "Critical";
  if (s >= 6) return "High";
  if (s >= 4) return "Medium";
  return "Low";
}

const DOMAIN_COLOR = {
  military: "#ff5370",
  political: "#4d94ff",
  humanitarian: "#2ecc8e",
  cyber: "#3ddcff",
  economic: "#ffaa3b",
};

const EVENT_TYPE_LABEL = {
  airstrike: "✈ Airstrike",
  missile_attack: "🚀 Missile Attack",
  drone_attack: "🛸 Drone Attack",
  military_movement: "🪖 Military Movement",
  protest: "📣 Protest",
  other: "📋 Other",
};

function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border p-5 animate-fade-in-up ${className}`}
      style={{
        background: "#171e2c",
        borderColor: "#2e3d58",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <p
      className="text-[10px] uppercase tracking-widest font-semibold mb-3"
      style={{ color: "#627a9e" }}
    >
      {text}
    </p>
  );
}

function StatTile({ label, value, color, sub }) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-1 animate-fade-in-up"
      style={{ background: "#1f2840", borderColor: "#2e3d58" }}
    >
      <p
        className="text-[10px] uppercase tracking-widest"
        style={{ color: "#627a9e" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold font-mono"
        style={{ color: color || "#f1f5ff" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px]" style={{ color: "#627a9e" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function SummaryView({ events = [], stats, onNavigate }) {
  if (!events || !stats) {
    return (
      <div className="space-y-5 max-w-6xl animate-pulse">
        {/* Header skeleton */}
        <div
          className="rounded-xl border p-5"
          style={{ background: "#171e2c", borderColor: "#2e3d58" }}
        >
          <div
            className="h-4 w-40 mb-3 rounded"
            style={{ background: "#2e3d58" }}
          />
          <div className="h-6 w-64 rounded" style={{ background: "#2e3d58" }} />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border"
              style={{ background: "#1f2840", borderColor: "#2e3d58" }}
            />
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl border"
              style={{ background: "#1f2840", borderColor: "#2e3d58" }}
            />
          ))}
        </div>
      </div>
    );
  }
  const analysis = useMemo(() => {
    if (!events.length) return null;

    const total = events.length;
    const critical = events.filter((e) => e.severity_score >= 8).length;
    const high = events.filter(
      (e) => e.severity_score >= 6 && e.severity_score < 8,
    ).length;
    const escalations = events.filter((e) => e.is_escalation_signal).length;
    const verified = events.filter((e) => e.verified).length;
    const avgSev = (
      events.reduce((a, e) => a + (e.severity_score || 0), 0) / total
    ).toFixed(1);
    const avgConf = (
      events.reduce((a, e) => a + (e.confidence_score || 0), 0) / total
    ).toFixed(1);

    let threatLevel = "LOW";
    if (avgSev >= 7 || critical >= 3) threatLevel = "CRITICAL";
    else if (avgSev >= 5.5 || critical >= 1) threatLevel = "HIGH";
    else if (avgSev >= 4) threatLevel = "ELEVATED";

    const topEvents = [...events]
      .sort(
        (a, b) =>
          b.severity_score - a.severity_score ||
          new Date(b.event_datetime_utc) - new Date(a.event_datetime_utc),
      )
      .slice(0, 5);

    const countryMap = {};
    events.forEach((e) => {
      const c = e.country || "Unknown";
      if (!countryMap[c]) countryMap[c] = { count: 0, totalSev: 0 };
      countryMap[c].count++;
      countryMap[c].totalSev += e.severity_score || 0;
    });
    const countries = Object.entries(countryMap)
      .map(([name, d]) => ({
        name,
        count: d.count,
        avgSev: (d.totalSev / d.count).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const domainMap = {};
    events.forEach((e) => {
      const d = e.domain || "other";
      domainMap[d] = (domainMap[d] || 0) + 1;
    });
    const domains = Object.entries(domainMap).sort((a, b) => b[1] - a[1]);

    const actorMap = {};
    events.forEach((e) => {
      [e.actor_1, e.actor_2].forEach((a) => {
        if (a) actorMap[a] = (actorMap[a] || 0) + 1;
      });
    });
    const topActors = Object.entries(actorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    const typeMap = {};
    events.forEach((e) => {
      const t = e.event_type || "other";
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    const types = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

    const contradictions = events.filter((e) => e.contradiction_flag).length;

    const latestEvent = [...events].sort(
      (a, b) => new Date(b.event_datetime_utc) - new Date(a.event_datetime_utc),
    )[0];

    return {
      total,
      critical,
      high,
      escalations,
      verified,
      avgSev,
      avgConf,
      threatLevel,
      topEvents,
      countries,
      domains,
      topActors,
      types,
      contradictions,
      latestEvent,
    };
  }, [events]);

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div
          className="w-14 h-14 rounded-full border flex items-center justify-center"
          style={{ background: "#1f2840", borderColor: "#2e3d58" }}
        >
          <svg
            className="w-6 h-6"
            style={{ color: "#627a9e" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5" />
            <polyline points="9 11 12 14 22 4" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: "#adbedd" }}>
          No event data available
        </p>
        <p className="text-xs" style={{ color: "#627a9e" }}>
          Summary will populate as events are ingested
        </p>
      </div>
    );
  }

  const a = analysis;
  const THREAT_C = {
    CRITICAL: {
      color: "#ff5370",
      bg: "rgba(255,83,112,0.13)",
      border: "rgba(255,83,112,0.35)",
    },
    HIGH: {
      color: "#ffaa3b",
      bg: "rgba(255,170,59,0.13)",
      border: "rgba(255,170,59,0.35)",
    },
    ELEVATED: {
      color: "#ffd166",
      bg: "rgba(255,209,102,0.11)",
      border: "rgba(255,209,102,0.3)",
    },
    LOW: {
      color: "#2ecc8e",
      bg: "rgba(46,204,142,0.11)",
      border: "rgba(46,204,142,0.28)",
    },
  };
  const tc = THREAT_C[a.threatLevel] || THREAT_C.LOW;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* ── Header banner ── */}
      <div
        className="rounded-xl border p-5 relative overflow-hidden animate-fade-in-up"
        style={{
          background: "linear-gradient(135deg, #171e2c 60%, #1a2236)",
          borderColor: tc.border,
          boxShadow: `0 0 0 1px ${tc.border}, 0 4px 24px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Corner glow */}
        <div
          className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${tc.color}12 0%, transparent 70%)`,
          }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold"
                style={{
                  color: tc.color,
                  background: tc.bg,
                  borderColor: tc.border,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
                {a.threatLevel} THREAT
              </div>
              <span className="text-xs" style={{ color: "#627a9e" }}>
                Updated {timeAgo(a.latestEvent?.last_updated_at)}
              </span>
            </div>
            <h2 className="text-lg font-bold" style={{ color: "#f1f5ff" }}>
              Conflict Intelligence Summary
            </h2>
            <p className="text-sm mt-1" style={{ color: "#adbedd" }}>
              {a.total} events ingested across {a.countries.length} countries ·{" "}
              {a.critical} critical-severity incidents detected
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigate?.("events")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                border transition-all duration-200 cursor-pointer"
              style={{
                background: "rgba(77,148,255,0.12)",
                borderColor: "rgba(77,148,255,0.35)",
                color: "#4d94ff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(77,148,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(77,148,255,0.12)";
              }}
            >
              View Event Feed →
            </button>
            <button
              onClick={() => onNavigate?.("map")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                border transition-all duration-200 cursor-pointer"
              style={{
                background: "rgba(46,204,142,0.1)",
                borderColor: "rgba(46,204,142,0.3)",
                color: "#2ecc8e",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(46,204,142,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(46,204,142,0.1)";
              }}
            >
              View Map →
            </button>
          </div>
        </div>
      </div>

      {/* ── Key metrics row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger">
        <StatTile label="Total Events" value={a.total} color="#f1f5ff" />
        <StatTile
          label="Critical"
          value={a.critical}
          color="#ff5370"
          sub="Severity ≥ 8"
        />
        <StatTile
          label="High"
          value={a.high}
          color="#ffaa3b"
          sub="Severity 6–8"
        />
        <StatTile
          label="Escalations"
          value={a.escalations}
          color="#b880ff"
          sub="Flagged signals"
        />
        <StatTile
          label="Avg Severity"
          value={`${a.avgSev}/10`}
          color={sevColor(parseFloat(a.avgSev))}
        />
        <StatTile
          label="Avg Confidence"
          value={`${a.avgConf}/10`}
          color="#4d94ff"
        />
      </div>

      {/* ── Top threat events + Country hotspots ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top severity events */}
        <Panel>
          <SectionLabel text="Top Threat Events" />
          <div className="space-y-3">
            {a.topEvents.map((ev, i) => (
              <div
                key={ev.id}
                className="flex gap-3 p-3 rounded-lg border transition-all duration-200 cursor-default group animate-fade-in-up"
                style={{
                  background: "#1f2840",
                  borderColor: "#2e3d58",
                  animationDelay: `${i * 40}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3a5070";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2e3d58";
                }}
              >
                {/* Severity pill */}
                <div
                  className="flex flex-col items-center justify-center shrink-0 w-12 rounded-lg border"
                  style={{
                    background: `${sevColor(ev.severity_score)}15`,
                    borderColor: `${sevColor(ev.severity_score)}35`,
                  }}
                >
                  <span
                    className="text-sm font-bold font-mono"
                    style={{ color: sevColor(ev.severity_score) }}
                  >
                    {ev.severity_score.toFixed(1)}
                  </span>
                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: `${sevColor(ev.severity_score)}aa` }}
                  >
                    {sevLabel(ev.severity_score).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {ev.country && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                        style={{
                          background: "#263147",
                          borderColor: "#2e3d58",
                          color: "#adbedd",
                        }}
                      >
                        {ev.country}
                      </span>
                    )}
                    {ev.domain && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: DOMAIN_COLOR[ev.domain] || "#adbedd",
                          background: `${DOMAIN_COLOR[ev.domain] || "#adbedd"}18`,
                        }}
                      >
                        {ev.domain}
                      </span>
                    )}
                    <span
                      className="text-[10px] ml-auto"
                      style={{ color: "#627a9e" }}
                    >
                      {timeAgo(ev.event_datetime_utc)}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: "#c8d8f0" }}
                  >
                    {ev.claim_text}
                  </p>
                  {(ev.actor_1 || ev.actor_2) && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {ev.actor_1 && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded border"
                          style={{
                            color: "#3ddcff",
                            borderColor: "rgba(61,220,255,0.25)",
                            background: "rgba(61,220,255,0.08)",
                          }}
                        >
                          {ev.actor_1}
                        </span>
                      )}
                      {ev.actor_2 && (
                        <>
                          <span style={{ color: "#627a9e", fontSize: 10 }}>
                            →
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded border"
                            style={{
                              color: "#3ddcff",
                              borderColor: "rgba(61,220,255,0.25)",
                              background: "rgba(61,220,255,0.08)",
                            }}
                          >
                            {ev.actor_2}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Country hotspots */}
        <Panel>
          <SectionLabel text="Country Hotspots" />
          <div className="space-y-2.5">
            {a.countries.map((c, i) => {
              const maxCount = a.countries[0]?.count || 1;
              const pct = Math.round((c.count / maxCount) * 100);
              const sc = parseFloat(c.avgSev);
              const cc = sevColor(sc);
              return (
                <div
                  key={c.name}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#f1f5ff" }}
                      >
                        {c.name}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ color: cc, background: `${cc}18` }}
                      >
                        Sev {c.avgSev}
                      </span>
                    </div>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: "#adbedd" }}
                    >
                      {c.count} event{c.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "#1f2840" }}
                  >
                    <div
                      className="h-full rounded-full bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: cc,
                        boxShadow: `0 0 5px ${cc}60`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ── Domain distribution + Event types + Top actors ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Domain distribution */}
        <Panel>
          <SectionLabel text="By Domain" />
          <div className="space-y-2.5">
            {a.domains.map(([domain, count], i) => {
              const pct = Math.round((count / a.total) * 100);
              const dc = DOMAIN_COLOR[domain] || "#adbedd";
              return (
                <div
                  key={domain}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs capitalize font-medium"
                      style={{ color: dc }}
                    >
                      {domain}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px]"
                        style={{ color: "#627a9e" }}
                      >
                        {pct}%
                      </span>
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{ color: "#adbedd" }}
                      >
                        {count}
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "#1f2840" }}
                  >
                    <div
                      className="h-full rounded-full bar-fill"
                      style={{ width: `${pct}%`, background: dc }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Event types */}
        <Panel>
          <SectionLabel text="Event Types" />
          <div className="space-y-2.5">
            {a.types.map(([type, count], i) => {
              const pct = Math.round((count / a.total) * 100);
              return (
                <div
                  key={type}
                  className="flex items-center gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span
                    className="text-xs w-36 shrink-0 capitalize"
                    style={{ color: "#adbedd" }}
                  >
                    {(EVENT_TYPE_LABEL[type] || type).replace(/_/g, " ")}
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "#1f2840" }}
                  >
                    <div
                      className="h-full rounded-full bar-fill"
                      style={{ width: `${pct}%`, background: "#4d94ff" }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono w-6 text-right"
                    style={{ color: "#627a9e" }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Top actors */}
        <Panel>
          <SectionLabel text="Most Active Actors" />
          <div className="space-y-2">
            {a.topActors.map((actor, i) => {
              const pct = Math.round(
                (actor.count / (a.topActors[0]?.count || 1)) * 100,
              );
              return (
                <div
                  key={actor.name}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#f1f5ff" }}
                    >
                      {actor.name}
                    </span>
                    <span
                      className="text-xs font-mono"
                      style={{ color: "#627a9e" }}
                    >
                      {actor.count} events
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "#1f2840" }}
                  >
                    <div
                      className="h-full rounded-full bar-fill"
                      style={{ width: `${pct}%`, background: "#b880ff" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ── Intelligence notes ── */}
      <Panel>
        <SectionLabel text="Intelligence Assessment" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Data quality */}
          <div
            className="rounded-lg p-3 border"
            style={{ background: "#1f2840", borderColor: "#2e3d58" }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#adbedd" }}
            >
              Data Quality
            </p>
            <div className="space-y-1.5">
              <Row label="Verified events" value={a.verified} color="#2ecc8e" />
              <Row
                label="Unverified"
                value={a.total - a.verified}
                color="#ffaa3b"
              />
              <Row
                label="Contradictions"
                value={a.contradictions}
                color="#ff5370"
              />
              <Row
                label="Avg confidence"
                value={`${a.avgConf}/10`}
                color="#4d94ff"
              />
            </div>
          </div>

          {/* Severity distribution */}
          <div
            className="rounded-lg p-3 border"
            style={{ background: "#1f2840", borderColor: "#2e3d58" }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#adbedd" }}
            >
              Severity Distribution
            </p>
            <div className="space-y-1.5">
              <Row label="Critical (8+)" value={a.critical} color="#ff5370" />
              <Row label="High (6–8)" value={a.high} color="#ffaa3b" />
              <Row
                label="Medium (4–6)"
                value={
                  events.filter(
                    (e) => e.severity_score >= 4 && e.severity_score < 6,
                  ).length
                }
                color="#ffd166"
              />
              <Row
                label="Low (< 4)"
                value={events.filter((e) => e.severity_score < 4).length}
                color="#2ecc8e"
              />
            </div>
          </div>

          {/* Coverage */}
          <div
            className="rounded-lg p-3 border"
            style={{ background: "#1f2840", borderColor: "#2e3d58" }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#adbedd" }}
            >
              Coverage
            </p>
            <div className="space-y-1.5">
              <Row
                label="Countries"
                value={a.countries.length}
                color="#4d94ff"
              />
              <Row
                label="Unique sources"
                value={[...new Set(events.map((e) => e.source_name))].length}
                color="#3ddcff"
              />
              <Row
                label="Active actors"
                value={
                  Object.keys(
                    events.reduce((m, e) => {
                      if (e.actor_1) m[e.actor_1] = 1;
                      if (e.actor_2) m[e.actor_2] = 1;
                      return m;
                    }, {}),
                  ).length
                }
                color="#b880ff"
              />
              <Row
                label="Escalation flags"
                value={a.escalations}
                color="#ff5370"
              />
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px]" style={{ color: "#627a9e" }}>
        {label}
      </span>
      <span className="text-[11px] font-semibold font-mono" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
