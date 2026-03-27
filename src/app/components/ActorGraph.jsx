"use client";
import { useEffect, useRef, useState } from "react";

const DOMAIN_COLOR = {
  military: "#ff5370",
  political: "#4d94ff",
  humanitarian: "#2ecc8e",
  cyber: "#3ddcff",
  economic: "#ffaa3b",
};
const THREAT_COLOR = {
  critical: "#ff5370",
  high: "#ffaa3b",
  medium: "#ffd166",
  low: "#2ecc8e",
};

export default function ActorGraph({
  actors = [],
  relations = [],
  onSelect,
  selected,
}) {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const simRef = useRef(null);

  const [tip, setTip] = useState(null);

  useEffect(() => {
    if (!actors.length || !svgRef.current || !wrapRef.current) return;
    let cancelled = false;

    import("d3").then((d3) => {
      if (cancelled) return;

      const wrap = wrapRef.current;
      const svgEl = svgRef.current;
      const W = wrap.clientWidth || 600;
      const H = wrap.clientHeight || 384;

      d3.select(svgEl).selectAll("*").remove();
      const svg = d3
        .select(svgEl)
        .attr("width", W)
        .attr("height", H)
        .attr("viewBox", `0 0 ${W} ${H}`);

      // Keep track of current transform so we can compute screen positions
      let currentTransform = d3.zoomIdentity;

      const g = svg.append("g");
      const zoom = d3
        .zoom()
        .scaleExtent([0.2, 4])
        .on("zoom", (e) => {
          currentTransform = e.transform;
          g.attr("transform", e.transform);
          // Update tooltip position if a node is being hovered
          setTip((prev) => {
            if (!prev) return null;
            return { ...prev, transform: currentTransform };
          });
        });
      svg.call(zoom);

      const actorMap = Object.fromEntries(actors.map((a) => [a.name, a]));
      const nodes = actors.map((a) => ({
        ...a,
        id: a.name,
        r: Math.max(13, Math.min(28, 10 + (a.event_count || 0) * 0.5)),
      }));
      const links = (relations || [])
        .filter((r) => actorMap[r.actor_1] && actorMap[r.actor_2])
        .map((r) => ({
          source: r.actor_1,
          target: r.actor_2,
          color: DOMAIN_COLOR[r.domain] || "#4a6080",
          width: Math.max(1, Math.min(5, (r.interaction_count || 1) * 0.5)),
        }));

      const sim = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(110)
            .strength(0.4),
        )
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(W / 2, H / 2))
        .force(
          "collision",
          d3.forceCollide((d) => d.r + 12),
        );

      simRef.current = sim;

      const link = g
        .append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", (d) => d.color)
        .attr("stroke-width", (d) => d.width)
        .attr("stroke-opacity", 0.3);

      const node = g
        .append("g")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .style("cursor", "pointer")
        .call(
          d3
            .drag()
            .on("start", (e, d) => {
              if (!e.active) sim.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on("drag", (e, d) => {
              d.fx = e.x;
              d.fy = e.y;
            })
            .on("end", (e, d) => {
              if (!e.active) sim.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            }),
        )
        .on("mouseenter", (e, d) => {
          setTip({ actor: d, transform: currentTransform });
        })
        .on("mouseleave", () => setTip(null))
        .on("click", (e, d) => {
          e.stopPropagation();
          onSelect?.(d);
        });

      svg.on("click.deselect", () => setTip(null));

      // Selection ring
      node
        .append("circle")
        .attr("r", (d) => d.r + 7)
        .attr("fill", "none")
        .attr("stroke", (d) =>
          selected?.name === d.id
            ? THREAT_COLOR[d.threat_level] || "#4d94ff"
            : "none",
        )
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.55);

      // Dashed ring
      node
        .append("circle")
        .attr("r", (d) => d.r + 4)
        .attr("fill", "none")
        .attr("stroke", (d) => THREAT_COLOR[d.threat_level] || "#2e3d58")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "3 3");

      // Main circle
      node
        .append("circle")
        .attr("r", (d) => d.r)
        .attr("fill", (d) => (THREAT_COLOR[d.threat_level] || "#1f2840") + "28")
        .attr("stroke", (d) => THREAT_COLOR[d.threat_level] || "#2e3d58")
        .attr("stroke-width", 1.5);

      // Label
      node
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-family", "Geist, system-ui")
        .attr("font-size", (d) => (d.r > 16 ? 9 : 8))
        .attr("font-weight", "500")
        .attr("fill", "#e2ecff")
        .text((d) => d.id);

      sim.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);

        // Live-update tooltip position as simulation ticks
        setTip((prev) => {
          if (!prev) return null;
          return { ...prev, transform: currentTransform };
        });
      });
    });

    return () => {
      cancelled = true;
      simRef.current?.stop();
    };
  }, [actors, relations, selected]);

  const tipStyle = (() => {
    if (!tip || !tip.actor || !wrapRef.current) return null;
    const d = tip.actor;
    const t = tip.transform;
    if (!t || d.x == null) return null;

    // Apply zoom/pan transform: screen_x = d.x * k + tx
    const sx = d.x * t.k + t.x;
    const sy = d.y * t.k + t.y;
    const r = (d.r || 14) * t.k;

    // Place tooltip above the node, centered horizontally
    const TIP_W = 200;
    const TIP_H = 130; // approximate

    const wrapW = wrapRef.current.clientWidth;

    let left = sx - TIP_W / 2;
    // Clamp so tooltip stays within wrapper
    left = Math.max(8, Math.min(wrapW - TIP_W - 8, left));

    const top = sy - r - TIP_H - 10; // above the node

    return { left, top };
  })();

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      <svg ref={svgRef} className="w-full h-full" />

      {/* Tooltip — position:absolute within wrapper, always above the node */}
      {tip && tipStyle && (
        <div
          className="animate-fade-in-scale pointer-events-none"
          style={{
            position: "absolute",
            left: tipStyle.left,
            top: tipStyle.top,
            zIndex: 100,
            width: 200,
            background: "#1f2840",
            border: "1px solid #3a5070",
            borderRadius: 12,
            padding: "10px 12px",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(77,148,255,0.1)",
          }}
        >
          {/* Actor name */}
          <p
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "#f1f5ff",
              marginBottom: 3,
            }}
          >
            {tip.actor.name}
          </p>
          {tip.actor.full_name && (
            <p
              style={{
                fontSize: 10,
                color: "#627a9e",
                marginBottom: 8,
                paddingBottom: 7,
                borderBottom: "1px solid #2e3d58",
                lineHeight: 1.4,
              }}
            >
              {tip.actor.full_name}
            </p>
          )}

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              ["Type", tip.actor.actor_type || "—"],
              ["Country", tip.actor.country || "—"],
              ["Events", tip.actor.event_count || 0],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "#627a9e" }}>{k}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#adbedd",
                    textTransform: "capitalize",
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 11, color: "#627a9e" }}>Threat</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: THREAT_COLOR[tip.actor.threat_level] || "#adbedd",
                }}
              >
                {(tip.actor.threat_level || "unknown").toUpperCase()}
              </span>
            </div>
          </div>

          {/* Small arrow pointing down toward the node */}
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #3a5070",
            }}
          />
        </div>
      )}
    </div>
  );
}
