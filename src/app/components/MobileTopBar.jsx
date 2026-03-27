"use client";

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

export default function MobileTopBar({ stats }) {
  const level = stats?.threatLevel || "LOW";
  const tc = THREAT_COLORS[level] || THREAT_COLORS.LOW;

  return (
    <div
      className="md:hidden flex items-center justify-between px-4 h-12 border-b shrink-0 w-full"
      style={{ background: "#111827", borderColor: "#2e3d58", zIndex: 30 }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #4d94ff, #b880ff)",
            boxShadow: "0 0 10px rgba(77,148,255,0.35)",
          }}
        >
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <span className="text-sm font-bold" style={{ color: "#f1f5ff" }}>
          SAIG Monitor
        </span>
      </div>

      {/* Threat pill */}
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold"
        style={{ color: tc.text, background: tc.bg, borderColor: tc.border }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
        {level}
      </div>
    </div>
  );
}
