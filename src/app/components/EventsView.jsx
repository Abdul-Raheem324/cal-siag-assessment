"use client";
import { useState } from "react";
import { DomainBadge, EscalationBadge, SeverityBadge } from "./ui/Badge";
import ConfidenceTooltip from "./ui/ConfidenceTooltip";

const DOMAINS = [
  "all",
  "military",
  "political",
  "humanitarian",
  "cyber",
  "economic",
];
const SEV_OPTS = [
  { label: "All", val: null },
  { label: "7+", val: 7 },
  { label: "5+", val: 5 },
  { label: "3+", val: 3 },
];

const DOMAIN_COLOR = {
  military: "#ff5370",
  political: "#4d94ff",
  humanitarian: "#2ecc8e",
  cyber: "#3ddcff",
  economic: "#ffaa3b",
};

function timeAgo(iso) {
  if (!iso) return "—";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toUTCString().replace(" GMT", " UTC");
}

export default function EventsView({
  total,
  events,
  loading,
  filters,
  onFilterChange,
}) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0">
      {/* Left: filters + list */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Filter bar */}
        <div
          className="border rounded-xl p-3 mb-4 space-y-3 animate-fade-in-up"
          style={{ background: "#171e2c", borderColor: "#2e3d58" }}
        >
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "#627a9e" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm outline-none transition-all duration-200"
              style={{
                background: "#1f2840",
                borderColor: "#2e3d58",
                color: "#f1f5ff",
                caretColor: "#4d94ff",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4d94ff";
                e.target.style.boxShadow = "0 0 0 3px rgba(77,148,255,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2e3d58";
                e.target.style.boxShadow = "none";
              }}
              placeholder="Search events…"
              value={filters.search || ""}
              onChange={(e) =>
                onFilterChange({ search: e.target.value || null })
              }
            />
          </div>

          {/* Domain + Severity pills */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {DOMAINS.map((d) => {
                const active =
                  d === "all" ? !filters.domain : filters.domain === d;
                const dc = DOMAIN_COLOR[d];
                return (
                  <button
                    key={d}
                    onClick={() =>
                      onFilterChange({ domain: d === "all" ? null : d })
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                      transition-all duration-200 cursor-pointer capitalize"
                    style={
                      active
                        ? {
                            background: `${dc || "#4d94ff"}22`,
                            borderColor: `${dc || "#4d94ff"}60`,
                            color: dc || "#4d94ff",
                            border: "1px solid",
                            boxShadow: `0 0 8px ${dc || "#4d94ff"}25`,
                          }
                        : {
                            background: "#1f2840",
                            border: "1px solid #2e3d58",
                            color: "#adbedd",
                          }
                    }
                  >
                    {dc && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: active ? dc : "#5d7599" }}
                      />
                    )}
                    {d}
                  </button>
                );
              })}
            </div>

            <div
              className="w-px self-stretch"
              style={{ background: "#2e3d58" }}
            />

            <div className="flex items-center gap-1.5">
              {SEV_OPTS.map((s) => {
                const active = filters.min_severity === s.val;
                return (
                  <button
                    key={s.label}
                    onClick={() => onFilterChange({ min_severity: s.val })}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                    style={
                      active
                        ? {
                            background: "rgba(255,83,112,0.18)",
                            border: "1px solid rgba(255,83,112,0.45)",
                            color: "#ff5370",
                          }
                        : {
                            background: "#1f2840",
                            border: "1px solid #2e3d58",
                            color: "#adbedd",
                          }
                    }
                  >
                    Sev {s.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                onFilterChange({ escalation: !filters.escalation })
              }
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                transition-all duration-200 cursor-pointer"
              style={
                filters.escalation
                  ? {
                      background: "rgba(255,170,59,0.15)",
                      border: "1px solid rgba(255,170,59,0.4)",
                      color: "#ffaa3b",
                    }
                  : {
                      background: "#1f2840",
                      border: "1px solid #2e3d58",
                      color: "#adbedd",
                    }
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: filters.escalation ? "#ffaa3b" : "#5d7599",
                }}
              />
              Escalations only
            </button>
          </div>
        </div>

        {/* Count */}
        <p className="text-xs mb-2 px-1" style={{ color: "#627a9e" }}>
          {loading ? "Loading…" : `${total} events`}
        </p>

        {/* Event list */}
        <div
          className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          {loading && (
            <div className="flex flex-col gap-3 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-24" />
              ))}
            </div>
          )}
          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg
                className="w-10 h-10"
                style={{ color: "#2e3d58" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm" style={{ color: "#627a9e" }}>
                No events match the current filters
              </p>
            </div>
          )}
          {events.map((ev, i) => (
            <EventCard
              key={ev.id}
              event={ev}
              index={i}
              selected={selected?.id === ev.id}
              onClick={() => setSelected(ev.id === selected?.id ? null : ev)}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 px-1">
          <button
            disabled={filters.offset === 0}
            onClick={() =>
              onFilterChange({
                offset: Math.max(0, filters.offset - filters.limit),
              })
            }
            className="text-xs px-3 py-1 rounded border"
            style={{ borderColor: "#2e3d58", color: "#adbedd" }}
          >
            Prev
          </button>

          <span className="text-xs" style={{ color: "#627a9e" }}>
            {filters.offset + 1} -{" "}
            {Math.min(filters.offset + filters.limit, total)} of {total}
          </span>

          <button
            disabled={filters.offset + filters.limit >= total}
            onClick={() =>
              onFilterChange({ offset: filters.offset + filters.limit })
            }
            className="text-xs px-3 py-1 rounded border"
            style={{ borderColor: "#2e3d58", color: "#adbedd" }}
          >
            Next
          </button>
        </div>
      </div>
      {/* Right: detail panel */}
      {selected && (
        // <div className="lg:w-96 shrink-0 animate-slide-in-left">
        <div className="fixed inset-0 z-50 lg:static lg:w-96 shrink-0 animate-slide-in-left">
          <EventDetail event={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}

function EventCard({ event: ev, selected, onClick, index }) {
  return (
    <div
      onClick={onClick}
      className="border rounded-xl p-4 cursor-pointer transition-all duration-200 animate-fade-in-up"
      style={{
        animationDelay: `${Math.min(index * 25, 280)}ms`,
        background: selected ? "rgba(77,148,255,0.07)" : "#171e2c",
        borderColor: selected ? "rgba(77,148,255,0.5)" : "#2e3d58",
        boxShadow: selected
          ? "0 0 0 1px rgba(77,148,255,0.2)"
          : "0 1px 6px rgba(0,0,0,0.25)",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.background = "#1f2840";
          e.currentTarget.style.borderColor = "#3a4f6e";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.background = "#171e2c";
          e.currentTarget.style.borderColor = "#2e3d58";
        }
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge score={ev.severity_score} />
          <DomainBadge domain={ev.domain} />
          {ev.is_escalation_signal && <EscalationBadge />}
        </div>
        <div
          className="flex items-center gap-2 text-xs shrink-0"
          style={{ color: "#627a9e" }}
        >
          {ev.country && <span style={{ color: "#adbedd" }}>{ev.country}</span>}
          <span>·</span>
          <span>{timeAgo(ev.event_datetime_utc)}</span>
        </div>
      </div>

      <p
        className={`text-sm leading-relaxed mb-3 ${selected ? "" : "line-clamp-2"}`}
        style={{ color: "#d4e0f5" }}
      >
        {ev.claim_text}
      </p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {ev.actor_1 && (
            <span
              className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md border"
              style={{
                background: "rgba(61,220,255,0.1)",
                color: "#3ddcff",
                borderColor: "rgba(61,220,255,0.25)",
              }}
            >
              {ev.actor_1}
            </span>
          )}
          {ev.actor_2 && (
            <>
              <span style={{ color: "#5d7599", fontSize: 12 }}>→</span>
              <span
                className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md border"
                style={{
                  background: "rgba(61,220,255,0.1)",
                  color: "#3ddcff",
                  borderColor: "rgba(61,220,255,0.25)",
                }}
              >
                {ev.actor_2}
              </span>
            </>
          )}
          {ev.actor_action && (
            <span className="text-[11px] italic" style={{ color: "#5d7599" }}>
              {ev.actor_action}
            </span>
          )}
        </div>
        <ConfidenceTooltip event={ev} />
      </div>
    </div>
  );
}

function EventDetail({ event: ev, onClose }) {
  return (
    // <div className="border rounded-xl overflow-hidden sticky top-0"
    <div
      className="border rounded-xl overflow-hidden h-full lg:h-auto"
      style={{
        background: "#151c2a",
        borderColor: "#2e3d58",
        boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "#1f2840", borderColor: "#2e3d58" }}
      >
        <span className="text-sm font-semibold" style={{ color: "#f1f5ff" }}>
          Event Detail
        </span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer text-sm"
          style={{ color: "#627a9e" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2e3d58";
            e.currentTarget.style.color = "#f1f5ff";
            e.currentTarget.style.transform = "rotate(90deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#627a9e";
            e.currentTarget.style.transform = "rotate(0deg)";
          }}
        >
          ✕
        </button>
      </div>

      <div
        className="p-4 space-y-4 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        <div className="flex flex-wrap gap-2">
          <SeverityBadge score={ev.severity_score} />
          <DomainBadge domain={ev.domain} />
          {ev.is_escalation_signal && <EscalationBadge />}
        </div>

        <div>
          <p
            className="text-[10px] uppercase tracking-widest mb-1.5"
            style={{ color: "#627a9e" }}
          >
            Claim
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#d4e0f5" }}>
            {ev.claim_text}
          </p>
        </div>

        {ev.ai_summary && (
          <div
            className="rounded-lg p-3 border"
            style={{
              background: "rgba(77,148,255,0.07)",
              borderColor: "rgba(77,148,255,0.2)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest mb-1.5"
              style={{ color: "#4d94ff" }}
            >
              AI Summary
            </p>
            <p
              className="text-xs leading-relaxed italic"
              style={{ color: "#adbedd" }}
            >
              {ev.ai_summary}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Severity",
              value: (ev.severity_score || 0).toFixed(1),
              color: "#ff5370",
            },
            {
              label: "Confidence",
              value: (ev.confidence_score || 0).toFixed(1),
              color: "#4d94ff",
            },
            {
              label: "Corroborations",
              value: ev.corroboration_count || 0,
              color: "#2ecc8e",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg p-3 text-center border"
              style={{ background: "#1f2840", borderColor: "#2e3d58" }}
            >
              <p
                className="text-lg font-bold font-mono"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#627a9e" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {(ev.actor_1 || ev.actor_2) && (
          <div>
            <p
              className="text-[10px] uppercase tracking-widest mb-2"
              style={{ color: "#627a9e" }}
            >
              Actors
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {ev.actor_1 && (
                <span
                  className="text-xs px-2.5 py-1 rounded-lg border"
                  style={{
                    background: "rgba(61,220,255,0.1)",
                    color: "#3ddcff",
                    borderColor: "rgba(61,220,255,0.25)",
                  }}
                >
                  {ev.actor_1}
                </span>
              )}
              {ev.actor_action && (
                <span className="text-xs italic" style={{ color: "#5d7599" }}>
                  {ev.actor_action}
                </span>
              )}
              {ev.actor_2 && (
                <span
                  className="text-xs px-2.5 py-1 rounded-lg border"
                  style={{
                    background: "rgba(61,220,255,0.1)",
                    color: "#3ddcff",
                    borderColor: "rgba(61,220,255,0.25)",
                  }}
                >
                  {ev.actor_2}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Country", value: ev.country || "—" },
            { label: "Location", value: ev.location_text || "—" },
            {
              label: "Event Type",
              value: (ev.event_type || "—").replace(/_/g, " "),
            },
            { label: "Source", value: ev.source_name || "—" },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-lg p-2.5 border"
              style={{ background: "#1f2840", borderColor: "#2e3d58" }}
            >
              <p className="text-[10px] mb-0.5" style={{ color: "#627a9e" }}>
                {f.label}
              </p>
              <p
                className="text-xs capitalize truncate"
                style={{ color: "#adbedd" }}
              >
                {f.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-lg p-2.5 border"
          style={{ background: "#1f2840", borderColor: "#2e3d58" }}
        >
          <p className="text-[10px] mb-0.5" style={{ color: "#627a9e" }}>
            Event Time
          </p>
          <p className="text-xs font-mono" style={{ color: "#adbedd" }}>
            {fmtDate(ev.event_datetime_utc)}
          </p>
        </div>

        {ev.source_url && (
          <a
            href={ev.source_url}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 text-xs transition-colors group"
            style={{ color: "#4d94ff" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#6aaeff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#4d94ff";
            }}
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            View source
          </a>
        )}

        {ev.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {ev.tags.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="text-[10px] border px-2 py-0.5 rounded-md"
                style={{
                  background: "#1f2840",
                  color: "#627a9e",
                  borderColor: "#2e3d58",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {/* {console.log("ev.verified",ev.verified)} */}
        <div className="flex gap-2 flex-wrap pt-1">
          {ev.verified && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-md border"
              style={{
                background: "rgba(46,204,142,0.1)",
                color: "#2ecc8e",
                borderColor: "rgba(46,204,142,0.28)",
              }}
            >
              ✓ Verified
            </span>
          )}
          {ev.contradiction_flag && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-md border"
              style={{
                background: "rgba(184,128,255,0.1)",
                color: "#b880ff",
                borderColor: "rgba(184,128,255,0.28)",
              }}
            >
              ⚠ Contradiction flagged
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
