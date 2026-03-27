'use client'

const sevColor = s => s >= 8 ? 'var(--color-threat-red)' : s >= 6 ? 'var(--color-threat-orange)' : s >= 4 ? 'var(--color-threat-amber)' : 'var(--color-dim)'
const confColor = c => c >= 7 ? 'var(--color-threat-green)' : c >= 5 ? 'var(--color-threat-amber)' : 'var(--color-threat-red)'

export default function EventDrilldown({ event, onClose }) {
  return (
    <div onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(9,11,14,0.85)', backdropFilter: 'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()}
        className="w-[640px] max-h-[80vh] overflow-y-auto relative"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderTop: `2px solid ${sevColor(event.severity_score)}`,
          fontFamily: 'var(--font-mono)',
        }}>

        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <Tag color={sevColor(event.severity_score)}>SEV {event.severity_score?.toFixed(1)}</Tag>
              <Tag color="var(--color-domain-political)">{(event.event_type||'other').replace('_',' ').toUpperCase()}</Tag>
              <Tag color="var(--color-dim)">{event.domain?.toUpperCase()}</Tag>
              {event.is_escalation_signal && <Tag color="var(--color-threat-orange)">↑ ESCALATION</Tag>}
              {event.verified && <Tag color="var(--color-threat-green)">✓ VERIFIED</Tag>}
            </div>
            <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
              {new Date(event.event_datetime_utc).toUTCString()}
            </p>
          </div>
          <button onClick={onClose}
            className="text-base bg-transparent border-none cursor-pointer ml-4 mt-0.5 leading-none transition-colors"
            style={{ color: 'var(--color-dim)' }}>✕</button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-4">
          <p className="text-[12px] leading-relaxed pl-3"
            style={{ color: 'var(--color-bright)', borderLeft: '2px solid var(--color-border)' }}>
            {event.claim_text}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="ACTOR 1"  value={event.actor_1  || '—'} />
            <Field label="ACTOR 2"  value={event.actor_2  || '—'} />
            <Field label="ACTION"   value={event.actor_action?.toUpperCase() || '—'} />
            <Field label="LOCATION" value={`${event.country} · ${event.location_text || '—'}`} />
          </div>

          {/* Confidence breakdown */}
          <div className="p-3" style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)' }}>
            <p className="text-[9px] tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>CONFIDENCE BREAKDOWN</p>
            <div className="grid grid-cols-2 gap-2">
              <ConfBar label="SOURCE TIER"   v={event.confidence_source_tier}   max={9} />
              <ConfBar label="RECENCY"       v={event.confidence_recency}       max={10} />
              <ConfBar label="CORROBORATION" v={event.confidence_corroboration} max={9} />
              <ConfBar label="OVERALL"       v={event.confidence_score}         max={10} bold />
            </div>
            <p className="text-[9px] mt-2" style={{ color: 'var(--color-muted)' }}>
              {event.source_name} · TIER {event.source_tier} · {event.corroboration_count} SOURCE(S)
            </p>
          </div>

          {/* Tags */}
          {event.tags?.filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.filter(Boolean).map((t, i) => (
                <span key={i} className="text-[9px] px-1.5 py-px rounded-sm"
                  style={{ background: 'var(--color-border)', color: 'var(--color-dim)' }}>{t}</span>
              ))}
            </div>
          )}

          {/* AI summary */}
          {event.ai_summary && (
            <div className="p-3"
              style={{ background: 'rgb(30 58 138 / 0.15)', border: '1px solid rgb(59 130 246 / 0.2)' }}>
              <p className="text-[9px] mb-1.5" style={{ color: 'var(--color-domain-political)' }}>⚡ AI SUMMARY</p>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-mid)' }}>{event.ai_summary}</p>
            </div>
          )}

          <a href={event.source_url} target="_blank" rel="noopener noreferrer"
            className="block text-[10px] transition-colors"
            style={{ color: 'var(--color-domain-political)' }}>
            → VIEW SOURCE: {event.source_url?.slice(0, 60)}...
          </a>
        </div>

        <div className="px-4 py-1.5 text-[9px] tracking-widest"
          style={{ borderTop: '1px solid var(--color-base)', color: 'var(--color-muted)' }}>
          ESC TO CLOSE
        </div>
      </div>
    </div>
  )
}

function Tag({ color, children }) {
  return (
    <span className="text-[9px] px-1.5 py-px tracking-wide rounded-sm border"
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)`, borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}>
      {children}
    </span>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[9px] mb-0.5" style={{ color: 'var(--color-muted)' }}>{label}</p>
      <p className="text-[11px]" style={{ color: 'var(--color-mid)' }}>{value}</p>
    </div>
  )
}

function ConfBar({ label, v, max, bold }) {
  const pct = Math.min(100, ((v || 0) / max) * 100)
  const c   = v >= 7 ? 'var(--color-threat-green)' : v >= 5 ? 'var(--color-threat-amber)' : 'var(--color-threat-red)'
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] w-28 shrink-0" style={{ color: 'var(--color-muted)' }}>{label}</span>
      <div className="flex-1 h-[3px]" style={{ background: 'var(--color-border)' }}>
        <div className="h-full" style={{ width: `${pct}%`, background: c }} />
      </div>
      <span className="text-[9px] tabular-nums min-w-[28px] text-right"
        style={{ color: bold ? 'var(--color-bright)' : 'var(--color-dim)', fontWeight: bold ? 700 : 400 }}>
        {(v || 0).toFixed(1)}
      </span>
    </div>
  )
}