"use client";

export function Card({ children, className = "", noPad = false }) {
  return (
    <div
      className={`rounded-xl border transition-colors duration-200 animate-fade-in-up
        ${noPad ? "" : "p-5"} ${className}`}
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

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "#f1f5ff" }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "#627a9e" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accentColor = "#4d94ff",
  delay = 0,
}) {
  return (
    <div
      className="rounded-xl border relative overflow-hidden group cursor-default
        transition-all duration-250 animate-fade-in-up animate-count-up"
      style={{
        background: "#171e2c",
        borderColor: "#2e3d58",
        padding: "20px",
        animationDelay: `${delay}ms`,
        boxShadow: "0 2px 14px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor + "80";
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accentColor}30, 0 4px 20px rgba(0,0,0,0.4)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2e3d58";
        e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,0.3)";
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}90, transparent)`,
        }}
      />
      {/* Corner radial */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
        }}
      />

      <div className="flex items-start justify-between relative">
        <div>
          <p
            className="text-[11px] uppercase tracking-wider mb-2"
            style={{ color: "#627a9e" }}
          >
            {label}
          </p>
          <p
            className="text-2xl font-bold font-mono"
            style={{ color: accentColor }}
          >
            {value}
          </p>
          <p className="text-[11px] mt-1.5" style={{ color: "#627a9e" }}>
            {sub}
          </p>
        </div>
        <span
          className="text-xl transition-all duration-300 group-hover:scale-110"
          style={{ opacity: 0.35 }}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
