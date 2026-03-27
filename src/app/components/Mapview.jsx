"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";

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
function timeAgo(iso) {
  if (!iso) return "—";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const DOMAIN_COLOR = {
  military: "#ff5370",
  political: "#4d94ff",
  humanitarian: "#2ecc8e",
  cyber: "#3ddcff",
  economic: "#ffaa3b",
};

function clusterEvents(events) {
  const clusters = {};
  events.forEach((ev) => {
    if (ev.latitude == null || ev.longitude == null) return;
    const key = ev.country || "Unknown";
    if (!clusters[key]) {
      clusters[key] = {
        key,
        country: ev.country || "Unknown",
        lat: ev.latitude,
        lng: ev.longitude,
        events: [],
        maxSev: 0,
      };
    }
    clusters[key].events.push(ev);
    if (ev.severity_score > clusters[key].maxSev) {
      clusters[key].maxSev = ev.severity_score;
    }
  });
  return Object.values(clusters);
}

/* ══════════════════════════════════════
   LEAFLET MAP COMPONENT
   Key fixes:
   1. Map container has explicit px height (500px) — never collapses
   2. Leaflet CSS injected via <style> tag, not <link>, to avoid FOUC
   3. map.invalidateSize() called after mount via ResizeObserver
   4. Markers rebuilt only when data changes, not on every render
   5. Single useEffect handles full lifecycle with proper cleanup
══════════════════════════════════════ */
function LeafletMap({ clusters, onClusterClick, selectedCluster }) {
  const containerRef = useRef(null);
  const stateRef = useRef({ map: null, L: null, markers: [] });

  /* ── Init map once ── */
  useEffect(() => {
    let destroyed = false;

    async function init() {
      if (!containerRef.current || stateRef.current.map) return;

      const L = (await import("leaflet")).default ?? (await import("leaflet"));

      if (destroyed || !containerRef.current) return;

      /* Inject Leaflet CSS once */
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }

      /* Fix broken default icon paths */
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        center: [28, 38],
        zoom: 4,
        zoomControl: true,
        attributionControl: true,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
          attribution:
            '© <a href="https://carto.com">CartoDB</a> © <a href="https://openstreetmap.org">OSM</a>',
        },
      ).addTo(map);

      stateRef.current = { map, L, markers: [] };

      /*
       * CRITICAL: Call invalidateSize after a small delay.
       * Leaflet measures the container at init time. If the container's
       * CSS height hasn't been applied yet (common in flex layouts),
       * the map renders blank. invalidateSize() forces a re-measure.
       */
      setTimeout(() => {
        if (!destroyed && stateRef.current.map) {
          stateRef.current.map.invalidateSize();
        }
      }, 100);

      /* Also re-measure whenever the container is resized */
      const ro = new ResizeObserver(() => {
        if (!destroyed && stateRef.current.map) {
          stateRef.current.map.invalidateSize();
        }
      });
      ro.observe(containerRef.current);
      stateRef.current.ro = ro;
    }

    init();

    return () => {
      destroyed = true;
      stateRef.current.ro?.disconnect();
      if (stateRef.current.map) {
        stateRef.current.markers.forEach((m) => m.remove());
        stateRef.current.map.remove();
        stateRef.current = { map: null, L: null, markers: [] };
      }
    };
  }, []); // run once

  /* ── Rebuild markers when clusters/selection change ── */
  useEffect(() => {
    const { map, L } = stateRef.current;
    if (!map || !L) {
      /* Map not ready yet — retry after init settles */
      const t = setTimeout(() => {
        const { map: m, L: l } = stateRef.current;
        if (m && l) buildMarkers(m, l);
      }, 300);
      return () => clearTimeout(t);
    }
    buildMarkers(map, L);

    function buildMarkers(map, L) {
      /* Remove previous */
      stateRef.current.markers.forEach((m) => m.remove());
      stateRef.current.markers = [];

      clusters.forEach((cluster) => {
        const sc = cluster.maxSev;
        const color = sevColor(sc);
        const isSelected = selectedCluster?.key === cluster.key;
        const count = cluster.events.length;
        const r = Math.max(18, Math.min(42, 14 + count * 4));
        const ring = isSelected
          ? `<div style="position:absolute;inset:-5px;border-radius:50%;border:2px solid ${color}55;pointer-events:none;"></div>`
          : "";

        const icon = L.divIcon({
          className: "",
          iconSize: [r * 2, r * 2],
          iconAnchor: [r, r],
          html: `<div style="
            width:${r * 2}px;height:${r * 2}px;border-radius:50%;
            background:${color}20;border:2.5px solid ${color};
            box-shadow:0 0 ${isSelected ? 20 : 10}px ${color}${isSelected ? "70" : "45"};
            display:flex;align-items:center;justify-content:center;
            flex-direction:column;cursor:pointer;position:relative;
            font-family:'Geist Mono',monospace;
          ">${ring}
            <span style="color:${color};font-weight:700;font-size:${r > 22 ? 13 : 11}px;line-height:1;">${count}</span>
            <span style="color:${color}99;font-size:8px;line-height:1.2;margin-top:1px;">${sevLabel(sc).slice(0, 4).toUpperCase()}</span>
          </div>`,
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon })
          .addTo(map)
          .on("click", () => onClusterClick(cluster));

        stateRef.current.markers.push(marker);
      });
    }
  }, [clusters, selectedCluster, onClusterClick]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "420px",
      }}
      /* Tailwind md: override via inline style is fine for this critical fix */
    />
  );
}

export default function MapView({ events = [] }) {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [domainFilter, setDomainFilter] = useState(null);
  const [sevFilter, setSevFilter] = useState(null);

  const handleClusterClick = useCallback((cluster) => {
    setSelectedCluster((prev) => (prev?.key === cluster.key ? null : cluster));
  }, []);

  const filtered = useMemo(
    () =>
      events.filter((ev) => {
        if (domainFilter && ev.domain !== domainFilter) return false;
        if (sevFilter && ev.severity_score < sevFilter) return false;
        return true;
      }),
    [events, domainFilter, sevFilter],
  );

  const clusters = useMemo(() => clusterEvents(filtered), [filtered]);

  const clusterEvList = selectedCluster
    ? [...selectedCluster.events].sort(
        (a, b) => b.severity_score - a.severity_score,
      )
    : [];

  const DOMAINS = [
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
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div
        className="rounded-xl border p-3 flex flex-wrap gap-2 items-center animate-fade-in-up"
        style={{ background: "#171e2c", borderColor: "#2e3d58" }}
      >
        <span className="text-xs font-semibold" style={{ color: "#627a9e" }}>
          Domain:
        </span>
        <FilterBtn
          active={!domainFilter}
          onClick={() => setDomainFilter(null)}
          color="#4d94ff"
        >
          All
        </FilterBtn>
        {DOMAINS.map((d) => (
          <FilterBtn
            key={d}
            active={domainFilter === d}
            onClick={() => setDomainFilter(domainFilter === d ? null : d)}
            color={DOMAIN_COLOR[d]}
          >
            {d}
          </FilterBtn>
        ))}

        <div
          className="w-px h-5 hidden sm:block"
          style={{ background: "#2e3d58" }}
        />

        <span className="text-xs font-semibold" style={{ color: "#627a9e" }}>
          Severity:
        </span>
        {SEV_OPTS.map((s) => (
          <FilterBtn
            key={s.label}
            active={sevFilter === s.val}
            onClick={() => setSevFilter(s.val)}
            color="#ff5370"
          >
            {s.label}
          </FilterBtn>
        ))}

        <span className="ml-auto text-xs" style={{ color: "#627a9e" }}>
          {filtered.length} events · {clusters.length} locations
        </span>
      </div>

      {/* Map card */}
      <div
        className="rounded-xl border overflow-hidden relative animate-fade-in-up"
        style={{ background: "#0d1117", borderColor: "#2e3d58" }}
      >
        {/* Legend — absolute over map */}
        <div
          className="absolute top-3 left-3 z-[400] rounded-lg border p-2.5"
          style={{
            background: "rgba(17,24,39,0.93)",
            borderColor: "#2e3d58",
            backdropFilter: "blur(8px)",
          }}
        >
          <p
            className="text-[9px] uppercase tracking-widest font-semibold mb-2"
            style={{ color: "#627a9e" }}
          >
            Severity
          </p>
          {[
            { label: "Critical (8+)", color: "#ff5370" },
            { label: "High (6–8)", color: "#ffaa3b" },
            { label: "Medium (4–6)", color: "#ffd166" },
            { label: "Low (< 4)", color: "#2ecc8e" },
          ].map((l) => (
            <div
              key={l.label}
              className="flex items-center gap-2 mb-1 last:mb-0"
            >
              <div
                className="w-3 h-3 rounded-full border-2 shrink-0"
                style={{ borderColor: l.color, background: `${l.color}25` }}
              />
              <span className="text-[10px]" style={{ color: "#adbedd" }}>
                {l.label}
              </span>
            </div>
          ))}
          <p
            className="text-[9px] mt-2 pt-2 border-t"
            style={{ color: "#627a9e", borderColor: "#2e3d58" }}
          >
            Number = event count
          </p>
        </div>

        {/* Click hint */}
        {!selectedCluster && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] px-3 py-1.5 rounded-lg border text-xs pointer-events-none"
            style={{
              background: "rgba(17,24,39,0.9)",
              borderColor: "#2e3d58",
              color: "#adbedd",
              backdropFilter: "blur(8px)",
              whiteSpace: "nowrap",
            }}
          >
            Click a marker to inspect events
          </div>
        )}

        <LeafletMap
          clusters={clusters}
          onClusterClick={handleClusterClick}
          selectedCluster={selectedCluster}
        />
      </div>

      {/* Bottom panel — selected location OR location list */}
      <div className="animate-fade-in-up">
        {selectedCluster ? (
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              background: "#171e2c",
              borderColor: "#2e3d58",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ background: "#1f2840", borderColor: "#2e3d58" }}
            >
              <div>
                <h3 className="text-sm font-bold" style={{ color: "#f1f5ff" }}>
                  {selectedCluster.country}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#627a9e" }}>
                  {clusterEvList.length} event
                  {clusterEvList.length !== 1 ? "s" : ""} · max severity{" "}
                  {selectedCluster.maxSev.toFixed(1)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-xs cursor-pointer"
                style={{ color: "#627a9e", background: "#263147" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f1f5ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#627a9e";
                }}
              >
                ✕
              </button>
            </div>

            {/* Severity tally */}
            <div
              className="px-4 py-3 border-b grid grid-cols-4 gap-2"
              style={{ borderColor: "#2e3d58" }}
            >
              {[
                ["Critical", "#ff5370"],
                ["High", "#ffaa3b"],
                ["Medium", "#ffd166"],
                ["Low", "#2ecc8e"],
              ].map(([lbl, col]) => (
                <div key={lbl} className="text-center">
                  <p
                    className="text-sm font-bold font-mono"
                    style={{ color: col }}
                  >
                    {
                      clusterEvList.filter(
                        (e) => sevLabel(e.severity_score) === lbl,
                      ).length
                    }
                  </p>
                  <p
                    className="text-[9px] uppercase"
                    style={{ color: "#627a9e" }}
                  >
                    {lbl}
                  </p>
                </div>
              ))}
            </div>

            {/* Event list — grid on desktop, stacked on mobile */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x overflow-y-auto"
              style={{ maxHeight: 400, borderColor: "#2e3d58" }}
            >
              {clusterEvList.map((ev) => (
                <div
                  key={ev.id}
                  className="px-4 py-3 transition-colors duration-150 border-b"
                  style={{ borderColor: "#2e3d58" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1f2840";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border"
                      style={{
                        color: sevColor(ev.severity_score),
                        background: `${sevColor(ev.severity_score)}15`,
                        borderColor: `${sevColor(ev.severity_score)}35`,
                      }}
                    >
                      {ev.severity_score.toFixed(1)}
                    </span>
                    {ev.domain && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                        style={{
                          color: DOMAIN_COLOR[ev.domain] || "#adbedd",
                          background: `${DOMAIN_COLOR[ev.domain] || "#adbedd"}18`,
                        }}
                      >
                        {ev.domain}
                      </span>
                    )}
                    {ev.event_type && ev.event_type !== "other" && (
                      <span
                        className="text-[10px] capitalize"
                        style={{ color: "#627a9e" }}
                      >
                        {ev.event_type.replace(/_/g, " ")}
                      </span>
                    )}
                    <span
                      className="ml-auto text-[10px]"
                      style={{ color: "#627a9e" }}
                    >
                      {timeAgo(ev.event_datetime_utc)}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed line-clamp-2 mb-1.5"
                    style={{ color: "#c8d8f0" }}
                  >
                    {ev.claim_text}
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
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
                    {ev.source_url && (
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noopener"
                        className="text-[10px]"
                        style={{ color: "#4d94ff" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#6aaeff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#4d94ff";
                        }}
                      >
                        {ev.source_name} ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Location list when nothing selected */
          <div
            className="rounded-xl border p-4"
            style={{ background: "#171e2c", borderColor: "#2e3d58" }}
          >
            <p
              className="text-xs font-semibold mb-3"
              style={{ color: "#adbedd" }}
            >
              Active Locations
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[...clusters]
                .sort((a, b) => b.maxSev - a.maxSev)
                .map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setSelectedCluster(c)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-left"
                    style={{ background: "#1f2840", borderColor: "#2e3d58" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        sevColor(c.maxSev) + "60";
                      e.currentTarget.style.background = "#263147";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#2e3d58";
                      e.currentTarget.style.background = "#1f2840";
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: sevColor(c.maxSev),
                          boxShadow: `0 0 6px ${sevColor(c.maxSev)}80`,
                        }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#f1f5ff" }}
                      >
                        {c.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: sevColor(c.maxSev) }}
                      >
                        {c.maxSev.toFixed(1)}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: "#627a9e" }}
                      >
                        {c.events.length} ev
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Reusable filter button */
function FilterBtn({ active, onClick, color, children }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer capitalize transition-all"
      style={
        active
          ? { background: `${color}22`, border: `1px solid ${color}60`, color }
          : {
              background: "#1f2840",
              border: "1px solid #2e3d58",
              color: "#adbedd",
            }
      }
    >
      {children}
    </button>
  );
}
