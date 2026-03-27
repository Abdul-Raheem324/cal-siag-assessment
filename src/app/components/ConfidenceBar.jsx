'use client';
import { useState } from 'react';

function scoreColor(s) {
  if (s >= 7) return '#22c55e';
  if (s >= 5) return '#f5a623';
  return '#e84040';
}

const TIER_LABEL = { 1: 'Tier 1 (Reuters/AP)', 2: 'Tier 2 (Guardian/AJE)', 3: 'Tier 3 (Regional)', 4: 'Tier 4 (Social/Blog)' };
const RECENCY_LABEL = r => r >= 2.5 ? 'Recent (<6h)' : r >= 1.5 ? 'Same day' : 'Older (24h+)';

export default function ConfidenceBar({ event }) {
  const [show, setShow] = useState(false);
  const score = event.confidence_score ?? 0;
  const tier  = event.confidence_source_tier ?? 0;
  const rec   = event.confidence_recency ?? 0;
  const corr  = event.confidence_corroboration ?? 0;
  const color = scoreColor(score);

  return (
    <div
      className="relative flex items-center gap-1.5 cursor-default"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="font-mono text-[10px] font-medium w-6 shrink-0" style={{ color }}>
        {score.toFixed(1)}
      </span>
      <div className="w-9 h-[3px] bg-bg-4 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score * 10}%`, background: color }} />
      </div>

      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-bg-3 border border-line-hi rounded-sm shadow-xl z-50 p-3 pointer-events-none">
          {/* Header */}
          <div className="font-mono text-[8px] tracking-widest text-ink-2 mb-2 pb-1.5 border-b border-line">
            CONFIDENCE&nbsp;
            <span className="font-semibold" style={{ color }}>{score.toFixed(1)}/10</span>
          </div>
          {/* Rows */}
          {[
            { label: 'Source tier (50%)', val: TIER_LABEL[event.source_tier] || `Tier ${event.source_tier || '?'}`, score: tier, color: '#3b82f6' },
            { label: 'Recency (30%)',     val: RECENCY_LABEL(rec),                                                   score: rec,  color: '#f5a623' },
            { label: 'Corroboration (20%)', val: `${event.corroboration_count || 0} source(s)`,                      score: corr, color: '#22c55e' },
          ].map(row => (
            <div key={row.label} className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[8px] text-ink-3 mb-0.5">{row.label}</div>
                <div className="font-mono text-[9px] text-ink-1 truncate">{row.val}</div>
              </div>
              <span className="font-mono text-[11px] font-medium shrink-0" style={{ color: row.color }}>
                {row.score.toFixed(1)}
              </span>
            </div>
          ))}
          <div className="font-mono text-[8px] text-ink-3 mt-2 pt-1.5 border-t border-line">
            via <span className="text-ink-1">{event.source_name || 'Unknown'}</span>
          </div>
        </div>
      )}
    </div>
  );
}