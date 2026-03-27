'use client';
import { useState } from 'react';

const TIER_LABEL = {
  1: 'Tier 1 — Reuters / AP / BBC',
  2: 'Tier 2 — Guardian / Al Jazeera',
  3: 'Tier 3 — Regional media',
  4: 'Tier 4 — Social / Blog',
};

function scoreColor(s) {
  if (s >= 7) return '#2ecc8e';
  if (s >= 5) return '#ffaa3b';
  return '#ff5370';
}

export default function ConfidenceTooltip({ event }) {
  const [show, setShow] = useState(false);
  const score = event.confidence_score ?? 0;
  const tier  = event.confidence_source_tier  ?? 0;
  const rec   = event.confidence_recency       ?? 0;
  const corr  = event.confidence_corroboration ?? 0;
  const color = scoreColor(score);

  return (
    <div
      className="relative inline-flex items-center gap-2 cursor-default"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full overflow-hidden"
          style={{ background: '#1f2840', border: '1px solid #2e3d58' }}>
          <div className="h-full rounded-full bar-fill"
            style={{ width: `${score * 10}%`, background: color }} />
        </div>
        <span className="text-xs font-mono font-semibold" style={{ color }}>{score.toFixed(1)}</span>
      </div>

      {show && (
        <div
          className="absolute bottom-full right-0 mb-2 w-64 rounded-xl z-50 pointer-events-none
            animate-fade-in-scale"
          style={{
            background:   '#1a2336',
            border:       '1px solid #2e3d58',
            boxShadow:    '0 16px 48px rgba(0,0,0,0.6)',
            padding:      '14px',
          }}
        >
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b"
            style={{ borderColor: '#2e3d58' }}>
            <span className="text-xs font-semibold" style={{ color: '#f1f5ff' }}>Confidence Score</span>
            <span className="text-sm font-bold font-mono" style={{ color }}>
              {score.toFixed(1)}
              <span className="text-xs font-normal" style={{ color: '#627a9e' }}>/10</span>
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Source Tier',   detail: TIER_LABEL[event.source_tier] || `Tier ${event.source_tier || '?'}`,
                val: tier, color: '#4d94ff', weight: '50%' },
              { label: 'Recency',       detail: rec >= 2.5 ? 'Recent (< 6h)' : rec >= 1.5 ? 'Same day' : 'Older (24h+)',
                val: rec, color: '#ffaa3b', weight: '30%' },
              { label: 'Corroboration', detail: `${event.corroboration_count || 0} independent source(s)`,
                val: corr, color: '#2ecc8e', weight: '20%' },
            ].map(row => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px]" style={{ color: '#adbedd' }}>
                    {row.label} <span style={{ color: '#5d7599' }}>({row.weight})</span>
                  </span>
                  <span className="text-xs font-mono font-semibold" style={{ color: row.color }}>
                    {row.val.toFixed(1)}
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden mb-1"
                  style={{ background: '#1f2840', border: '1px solid #2e3d58' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${row.val * 10}%`, background: row.color }} />
                </div>
                <p className="text-[10px]" style={{ color: '#5d7599' }}>{row.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t text-[10px]"
            style={{ borderColor: '#2e3d58', color: '#5d7599' }}>
            Source: <span style={{ color: '#adbedd' }}>{event.source_name || 'Unknown'}</span>
          </div>
        </div>
      )}
    </div>
  );
}