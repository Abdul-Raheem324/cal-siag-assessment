"use client";
import { useState, useEffect } from "react";

const THREAT_STYLES = {
  CRITICAL: "text-red border-red/40 bg-red/10",
  HIGH: "text-amber border-amber/40 bg-amber/10",
  ELEVATED: "text-lemon border-lemon/40 bg-lemon/10",
  LOW: "text-green border-green/40 bg-green/10",
};
const THREAT_DOT = {
  CRITICAL: "bg-red",
  HIGH: "bg-amber",
  ELEVATED: "bg-lemon",
  LOW: "bg-green",
};

export default function TopBar({ stats }) {
  const [utc, setUtc] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtc(
        now
          .toUTCString()
          .replace(/^.*?, /, "")
          .replace(" GMT", " UTC"),
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const level = stats?.threatLevel || "LOW";

  return (
    <header className="flex items-center h-11 px-4 bg-bg-1 border-b border-line shrink-0 gap-4 z-50">
      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 shrink-0 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-red shadow-[0_0_8px_#e84040] animate-pulse shrink-0" />
        <span className="text-[13px] font-semibold tracking-[0.15em] text-ink-0">
          SAIG
        </span>
        <span className="text-ink-3 text-xs">/</span>
        <span className="text-[9px] tracking-[0.12em] text-ink-2">
          OSINT CONFLICT MONITOR
        </span>
      </div>

      <div className="h-4 w-px bg-line shrink-0" />

      <span className="font-mono text-[8px] tracking-[0.1em] text-ink-2 border border-line px-2 py-0.5 rounded-sm shrink-0">
        IRAN · US · ISRAEL · REGION
      </span>
      <span className="font-mono text-[8px] tracking-[0.1em] text-amber border border-amber/40 bg-amber/8 px-2 py-0.5 rounded-sm shrink-0">
        LIVE
      </span>

      {/* ── Stats ── */}
      <div className="flex items-center gap-1 flex-1 justify-center">
        <StatChip label="EVENTS" value={stats?.totalEvents ?? "—"} />
        <div className="h-4 w-px bg-line" />
        <StatChip
          label="ESC SIGNALS"
          value={stats?.escalationCount ?? "—"}
          color="text-red"
        />
        <div className="h-4 w-px bg-line" />
        <StatChip
          label="AVG SEVERITY"
          value={stats?.avgSeverity ?? "—"}
          color="text-amber"
        />
        <div className="h-4 w-px bg-line" />
        <StatChip
          label="AVG CONF"
          value={stats?.avgConfidence ?? "—"}
          color="text-green"
        />
      </div>

      {/* ── Threat ── */}
      <div
        className={`flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] px-3 py-1 border rounded-sm shrink-0 ${THREAT_STYLES[level]}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${THREAT_DOT[level]}`}
        />
        THREAT: {level}
      </div>

      <div className="h-4 w-px bg-line shrink-0" />

      {/* ── Clock ── */}
      <span className="font-mono text-[10px] text-ink-2 tracking-wide shrink-0">
        {utc}
      </span>
    </header>
  );
}

function StatChip({ label, value, color = "text-ink-0" }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3">
      <span className={`font-mono text-base font-medium leading-none ${color}`}>
        {value}
      </span>
      <span className="font-mono text-[8px] tracking-[0.1em] text-ink-3">
        {label}
      </span>
    </div>
  );
}
