"use client";
import { useState } from "react";
import ConfidenceBar from "./ConfidenceBar";

const DOMAIN_COLOR = {
  military: {
    text: "text-red",
    border: "border-red/30",
    bg: "bg-red/8",
    bar: "#e84040",
  },
  political: {
    text: "text-blue",
    border: "border-blue/30",
    bg: "bg-blue/8",
    bar: "#3b82f6",
  },
  humanitarian: {
    text: "text-green",
    border: "border-green/30",
    bg: "bg-green/8",
    bar: "#22c55e",
  },
  cyber: {
    text: "text-cyan",
    border: "border-cyan/30",
    bg: "bg-cyan/8",
    bar: "#06b6d4",
  },
  economic: {
    text: "text-amber",
    border: "border-amber/30",
    bg: "bg-amber/8",
    bar: "#f5a623",
  },
};

function severityStyle(s) {
  if (s >= 8.5)
    return {
      text: "text-red",
      border: "border-red/40",
      bg: "bg-red/10",
      label: "CRIT",
    };
  if (s >= 6.5)
    return {
      text: "text-amber",
      border: "border-amber/40",
      bg: "bg-amber/10",
      label: "HIGH",
    };
  if (s >= 4)
    return {
      text: "text-lemon",
      border: "border-lemon/40",
      bg: "bg-lemon/10",
      label: "MED",
    };
  return {
    text: "text-green",
    border: "border-green/40",
    bg: "bg-green/10",
    label: "LOW",
  };
}

function timeAgo(iso) {
  if (!iso) return "—";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const DOMAINS = [
  "all",
  "military",
  "political",
  "humanitarian",
  "cyber",
  "economic",
];
const SEV_OPTS = [
  { label: "ALL", val: null },
  { label: "7+", val: 7 },
  { label: "5+", val: 5 },
];

export default function EventFeed({
  events,
  loading,
  filters,
  onFilterChange,
  onSelect,
  selectedId,
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Filter row ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-bg-2 border-b border-line shrink-0 flex-wrap">
        {/* Domain filters */}
        <div className="flex gap-1 flex-wrap">
          {DOMAINS.map((d) => {
            const dc = DOMAIN_COLOR[d];
            const active =
              filters.domain === d || (!filters.domain && d === "all");
            return (
              <button
                key={d}
                onClick={() =>
                  onFilterChange({ domain: d === "all" ? null : d })
                }
                className={`font-mono text-[8px] tracking-widest px-2 py-1 border rounded-sm transition-colors cursor-pointer ${
                  active
                    ? dc
                      ? `${dc.text} ${dc.border} ${dc.bg}`
                      : "text-ink-0 border-line-hi bg-bg-4"
                    : "text-ink-3 border-line hover:text-ink-1 hover:border-line-hi"
                }`}
              >
                {d.toUpperCase()}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-line shrink-0" />

        {/* Severity filters */}
        <div className="flex gap-1">
          {SEV_OPTS.map((s) => (
            <button
              key={s.label}
              onClick={() => onFilterChange({ min_severity: s.val })}
              className={`font-mono text-[8px] tracking-widest px-2 py-1 border rounded-sm transition-colors cursor-pointer ${
                filters.min_severity === s.val
                  ? "text-ink-0 border-line-hi bg-bg-4"
                  : "text-ink-3 border-line hover:text-ink-1"
              }`}
            >
              SEV {s.label}
            </button>
          ))}
        </div>

        {/* Escalation toggle */}
        <button
          onClick={() => onFilterChange({ escalation: !filters.escalation })}
          className={`font-mono text-[8px] tracking-widest px-2 py-1 border rounded-sm transition-colors cursor-pointer ${
            filters.escalation
              ? "text-amber border-amber/50 bg-amber/10"
              : "text-ink-3 border-line hover:text-ink-1"
          }`}
        >
          ⚡ ESC ONLY
        </button>

        {/* Search */}
        <input
          className="flex-1 min-w-24 bg-bg-3 border border-line rounded-sm px-2 py-1 font-mono text-[10px] text-ink-0 placeholder-ink-3 outline-none focus:border-line-hi"
          placeholder="Search events…"
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value || null })}
        />
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-24 font-mono text-[10px] text-ink-3 tracking-widest">
            LOADING…
          </div>
        )}
        {!loading && events.length === 0 && (
          <div className="flex items-center justify-center h-24 font-mono text-[10px] text-ink-3 tracking-widest">
            NO EVENTS MATCH FILTERS
          </div>
        )}
        {events.map((ev) => (
          <EventRow
            key={ev.id}
            ev={ev}
            selected={selectedId === ev.id}
            onClick={() => onSelect(ev)}
          />
        ))}
      </div>
    </div>
  );
}

function EventRow({ ev, selected, onClick }) {
  const dc = DOMAIN_COLOR[ev.domain] || { bar: "#5a6a82" };
  const sev = severityStyle(ev.severity_score || 0);

  return (
    <div
      onClick={onClick}
      className={`flex items-stretch border-b border-line cursor-pointer transition-colors ${
        selected
          ? "bg-bg-3"
          : ev.is_escalation_signal
            ? "bg-amber/[0.025] hover:bg-amber/[0.05]"
            : "hover:bg-bg-2"
      }`}
    >
      {/* Domain accent bar */}
      <div
        className="w-[3px] shrink-0 opacity-70"
        style={{ background: dc.bar }}
      />

      <div className="flex-1 px-3 py-2 min-w-0">
        {/* Row 1: badges + meta */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          {/* Severity */}
          <span
            className={`font-mono text-[9px] font-semibold px-1.5 py-0.5 border rounded-sm flex items-center gap-1 ${sev.text} ${sev.border} ${sev.bg}`}
          >
            {(ev.severity_score || 0).toFixed(1)}
            <span className="text-[7px] opacity-80">{sev.label}</span>
          </span>

          {/* Domain */}
          <span
            className={`font-mono text-[8px] font-medium tracking-widest ${dc.text || "text-ink-2"}`}
          >
            {ev.domain?.toUpperCase()}
          </span>

          {/* Event type */}
          <span className="text-[9px] text-ink-2 uppercase tracking-wide">
            {(ev.event_type || "other").replace(/_/g, " ")}
          </span>

          {ev.is_escalation_signal && (
            <span className="font-mono text-[8px] text-amber border border-amber/30 bg-amber/8 px-1.5 py-0.5 rounded-sm">
              ⚡ ESC
            </span>
          )}
          {ev.contradiction_flag && (
            <span className="font-mono text-[8px] text-violet border border-violet/30 bg-violet/8 px-1.5 py-0.5 rounded-sm">
              ⚠ CONFLICT
            </span>
          )}

          {/* Right-aligned meta */}
          <div className="ml-auto flex items-center gap-3">
            {ev.country && (
              <span className="font-mono text-[9px] text-ink-3">
                {ev.country}
              </span>
            )}
            <span className="font-mono text-[9px] text-ink-3">
              {timeAgo(ev.event_datetime_utc)}
            </span>
            <span className="font-mono text-[9px] text-ink-3 hidden sm:block truncate max-w-28">
              {ev.source_name}
            </span>
          </div>
        </div>

        {/* Row 2: claim text */}
        <p
          className={`text-[11px] leading-[1.45] mb-1.5 ${selected ? "text-ink-0" : "text-ink-1 line-clamp-2"}`}
        >
          {ev.claim_text}
        </p>

        {/* Row 3: actors + confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {ev.actor_1 && (
              <span className="font-mono text-[9px] text-cyan border border-cyan/20 bg-cyan/6 px-1.5 py-0.5 rounded-sm">
                {ev.actor_1}
              </span>
            )}
            {ev.actor_2 && (
              <>
                <span className="text-ink-3 text-[9px]">→</span>
                <span className="font-mono text-[9px] text-cyan border border-cyan/20 bg-cyan/6 px-1.5 py-0.5 rounded-sm">
                  {ev.actor_2}
                </span>
              </>
            )}
            {ev.actor_action && (
              <span className="text-[9px] text-ink-2 italic">
                {ev.actor_action}
              </span>
            )}
          </div>
          <ConfidenceBar event={ev} />
        </div>
      </div>
    </div>
  );
}
