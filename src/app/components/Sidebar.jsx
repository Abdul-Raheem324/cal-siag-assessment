"use client";

const NAV = [
  { id: "summary", label: "Summary", icon: SummaryIcon },
  { id: "overview", label: "Overview", icon: LayoutIcon },
  { id: "events", label: "Events", icon: ListIcon },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "actors", label: "Actors", icon: NetworkIcon },
  { id: "sources", label: "Sources", icon: SourceIcon },
];

const THREAT_COLORS = {
  CRITICAL: {
    text: "#ff5370",
    bg: "rgba(255,83,112,0.12)",
    border: "rgba(255,83,112,0.32)",
  },
  HIGH: {
    text: "#ffaa3b",
    bg: "rgba(255,170,59,0.12)",
    border: "rgba(255,170,59,0.32)",
  },
  ELEVATED: {
    text: "#ffd166",
    bg: "rgba(255,209,102,0.1)",
    border: "rgba(255,209,102,0.28)",
  },
  LOW: {
    text: "#2ecc8e",
    bg: "rgba(46,204,142,0.1)",
    border: "rgba(46,204,142,0.28)",
  },
};

export default function Sidebar({ activeView, onViewChange, stats }) {
  const level = stats?.threatLevel || "LOW";
  const tc = THREAT_COLORS[level] || THREAT_COLORS.LOW;

  return (
    <aside
      className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 border-r"
      style={{ background: "#111827", borderColor: "#2e3d58" }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: "#2e3d58" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #4d94ff, #b880ff)",
              boxShadow: "0 0 14px rgba(77,148,255,0.35)",
            }}
          >
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div>
            <p
              className="text-sm font-bold leading-none"
              style={{ color: "#f1f5ff" }}
            >
              SAIG
            </p>
            <p
              className="text-[10px] mt-0.5 leading-none"
              style={{ color: "#627a9e" }}
            >
              Conflict Monitor
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b" style={{ borderColor: "#2e3d58" }}>
        <p
          className="text-[10px] uppercase tracking-widest mb-2"
          style={{ color: "#627a9e" }}
        >
          Threat Level
        </p>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
          style={{ color: tc.text, background: tc.bg, borderColor: tc.border }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
          {level}
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item, i) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                transition-all duration-200 cursor-pointer text-left relative overflow-hidden group
                animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span
                className="absolute inset-0 rounded-xl"
                style={{
                  background: active
                    ? "linear-gradient(90deg,rgba(77,148,255,0.18),rgba(184,128,255,0.08))"
                    : "transparent",
                }}
              />
              {!active && (
                <span
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: "rgba(46,61,88,0.5)" }}
                />
              )}
              {active && (
                <span
                  className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r-full"
                  style={{
                    background: "linear-gradient(180deg,#4d94ff,#b880ff)",
                  }}
                />
              )}
              <Icon
                className="w-4 h-4 shrink-0 relative z-10"
                style={{ color: active ? "#4d94ff" : "#627a9e" }}
              />
              <span
                className="relative z-10 font-medium transition-colors duration-200"
                style={{ color: active ? "#f1f5ff" : "#adbedd" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div
        className="px-4 py-3 border-t space-y-2"
        style={{ borderColor: "#2e3d58" }}
      >
        <MiniStat
          label="Total Events"
          value={stats?.totalEvents ?? "—"}
          color="#adbedd"
        />
        <MiniStat
          label="Escalation Signals"
          value={stats?.escalationCount ?? "—"}
          color="#ffaa3b"
        />
        <MiniStat
          label="Avg Severity"
          value={stats?.avgSeverity ?? "—"}
          color="#ff5370"
        />
      </div>
    </aside>
  );
}

function MiniStat({ label, value, color }) {
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

function SummaryIcon({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5" />
      <polyline points="9 11 12 14 22 4" />
      <path d="M16 17l2 2 4-4" />
    </svg>
  );
}
function LayoutIcon({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ListIcon({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function MapIcon({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function NetworkIcon({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="12" y1="7" x2="5" y2="17" />
      <line x1="12" y1="7" x2="19" y2="17" />
      <line x1="5" y1="19" x2="19" y2="19" />
    </svg>
  );
}
function SourceIcon({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}
