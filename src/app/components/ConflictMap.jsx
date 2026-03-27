"use client";
import { useEffect, useRef } from "react";

const SEV_TIERS = [
  { min: 8, color: "#ef4444", ring: "#ef444440" },
  { min: 6, color: "#f97316", ring: "#f9731640" },
  { min: 4, color: "#eab308", ring: "#eab30840" },
  { min: 0, color: "#4a5568", ring: "#4a556840" },
];

function sevStyle(s) {
  return SEV_TIERS.find((t) => s >= t.min) || SEV_TIERS[3];
}

export default function ConflictMap({ events, onSelectEvent }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (typeof window === "undefined" || mapInstance.current) return;
    const L = require("leaflet");
    require("leaflet/dist/leaflet.css");

    const map = L.map(mapRef.current, {
      center: [29, 44],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 18,
        subdomains: "abcd",
      },
    ).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    mapInstance.current = map;
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !events.length) return;
    const L = require("leaflet");

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Cluster by rounded coordinates
    const groups = {};
    events.forEach((ev) => {
      if (!ev.latitude || !ev.longitude) return;
      const key = `${Number(ev.latitude).toFixed(2)},${Number(ev.longitude).toFixed(2)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });

    Object.entries(groups).forEach(([, evs]) => {
      const top = evs.sort((a, b) => b.severity_score - a.severity_score)[0];
      const { color, ring } = sevStyle(top.severity_score);
      const count = evs.length;
      const hasEsc = evs.some((e) => e.is_escalation_signal);
      const size = Math.min(34, 16 + count * 2);

      const html = `
        <div style="
          width:${size}px;height:${size}px;
          background:${color}18;border:1.5px solid ${color};
          border-radius:50%;display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 ${hasEsc ? 10 : 4}px ${ring};
          position:relative;cursor:pointer;
        ">
          ${
            hasEsc
              ? `<div style="
            position:absolute;inset:-6px;border-radius:50%;
            border:1px solid ${color}44;
            animation:pulse-ring 2s ease-out infinite;
          "></div>`
              : ""
          }
          <span style="color:${color};font-size:${count > 9 ? 8 : 9}px;
            font-family:'IBM Plex Mono',monospace;font-weight:700;">
            ${count > 1 ? count : ""}
          </span>
        </div>`;

      const icon = L.divIcon({
        html,
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([top.latitude, top.longitude], { icon })
        .addTo(mapInstance.current)
        .on("click", () => onSelectEvent && onSelectEvent(top));

      marker.bindTooltip(
        `
        <div style="background:#0d1117;border:1px solid #1a1f26;padding:6px 10px;
          font-family:'IBM Plex Mono',monospace;font-size:10px;color:#718096;">
          <div style="color:${color};font-weight:700;">${top.country} · SEV ${top.severity_score?.toFixed(1)}</div>
          <div>${(top.event_type || "").replace("_", " ").toUpperCase()}</div>
          <div style="color:#4a5568;">${count} EVENT${count > 1 ? "S" : ""}</div>
        </div>`,
        { className: "dark-tip", direction: "top", permanent: false },
      );

      markersRef.current.push(marker);
    });
  }, [events, onSelectEvent]);

  return (
    <div className="relative h-full">
      {/* Panel label */}
      <div className="absolute top-2 left-3 z-[1000] text-dim text-[10px] tracking-widest pointer-events-none">
        CONFLICT MAP
      </div>

      {/* Severity legend */}
      <div className="absolute bottom-2 left-3 z-[1000] flex gap-2.5 pointer-events-none">
        {SEV_TIERS.map((t, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: t.color + "30",
                border: `1px solid ${t.color}`,
              }}
            />
            <span className="text-muted text-[9px]">{t.min}+</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: "#f9731630",
              border: "1px solid #f97316",
              boxShadow: "0 0 5px #f9731644",
            }}
          />
          <span className="text-muted text-[9px]">ESC</span>
        </div>
      </div>

      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
