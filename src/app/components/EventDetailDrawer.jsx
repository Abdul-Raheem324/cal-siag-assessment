'use client';
import ConfidenceBar from './ConfidenceBar';

const DOMAIN_COLOR = {
  military: '#e84040', political: '#3b82f6', humanitarian: '#22c55e',
  cyber: '#06b6d4', economic: '#f5a623',
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toUTCString().replace(' GMT', ' UTC');
}

function sevColor(s) {
  if (s >= 8.5) return '#e84040';
  if (s >= 6.5) return '#f5a623';
  if (s >= 4)   return '#facc15';
  return '#22c55e';
}

export default function EventDetailDrawer({ event, onClose }) {
  if (!event) return null;
  const dc = DOMAIN_COLOR[event.domain] || '#5a6a82';
  const sc = sevColor(event.severity_score || 0);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-bg-2 border-l border-line-hi z-50 flex flex-col overflow-y-auto animate-[slideIn_0.18s_ease-out]"
        style={{ animation: 'slideIn 0.18s ease-out' }}>

        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-bg-3 border-b shrink-0" style={{ borderColor: dc + '55' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[9px] font-semibold tracking-widest" style={{ color: dc }}>
              {event.domain?.toUpperCase()}
            </span>
            <span className="text-[10px] text-ink-1 uppercase tracking-wide">
              {(event.event_type || '').replace(/_/g, ' ')}
            </span>
            {event.is_escalation_signal && (
              <span className="font-mono text-[8px] text-amber border border-amber/30 bg-amber/8 px-2 py-0.5 rounded-sm">
                ⚡ ESCALATION SIGNAL
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center border border-line rounded-sm text-ink-2 hover:text-ink-0 hover:border-line-hi text-[10px] cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Score row */}
        <div className="flex items-center bg-bg-3 border-b border-line shrink-0">
          <ScoreBlock label="SEVERITY"      value={`${(event.severity_score || 0).toFixed(1)}/10`} color={sc} />
          <div className="w-px h-8 bg-line" />
          <div className="flex flex-col items-center gap-1.5 flex-1 py-3">
            <span className="font-mono text-[8px] tracking-widest text-ink-3">CONFIDENCE</span>
            <ConfidenceBar event={event} />
          </div>
          <div className="w-px h-8 bg-line" />
          <ScoreBlock label="CORROBORATIONS" value={event.corroboration_count || 0} color="#3b82f6" />
        </div>

        {/* Claim */}
        <Section label="CLAIM">
          <p className="text-[12px] text-ink-0 leading-relaxed">{event.claim_text}</p>
        </Section>

        {/* AI Summary */}
        {event.ai_summary && (
          <Section label="AI SUMMARY">
            <p className="text-[11px] text-ink-1 leading-relaxed italic">{event.ai_summary}</p>
          </Section>
        )}

        {/* Actors */}
        <Section label="ACTORS">
          <div className="flex items-center gap-2 flex-wrap">
            {event.actor_1 && <ActorChip name={event.actor_1} />}
            {event.actor_action && <span className="text-[10px] text-ink-2 italic">{event.actor_action}</span>}
            {event.actor_2 && <ActorChip name={event.actor_2} />}
          </div>
        </Section>

        {/* Location grid */}
        <div className="grid grid-cols-2 border-b border-line">
          <Field label="COUNTRY"  value={event.country       || '—'} />
          <Field label="LOCATION" value={event.location_text || '—'} />
          {event.latitude  && <Field label="LAT" value={event.latitude}  mono />}
          {event.longitude && <Field label="LON" value={event.longitude} mono />}
        </div>

        {/* Source */}
        <Section label="SOURCE">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] text-ink-0 font-medium">{event.source_name}</span>
            <span className="font-mono text-[8px] text-blue border border-blue/25 bg-blue/8 px-1.5 py-0.5 rounded-sm">
              TIER {event.source_tier}
            </span>
            <span className="font-mono text-[8px] text-ink-2">{event.source_type}</span>
          </div>
          {event.source_url && (
            <a
              href={event.source_url} target="_blank" rel="noopener"
              className="font-mono text-[9px] text-blue/60 hover:text-blue truncate block"
            >
              {event.source_url}
            </a>
          )}
        </Section>

        {/* Timestamps grid */}
        <div className="grid grid-cols-2 border-b border-line">
          <Field label="EVENT TIME" value={fmt(event.event_datetime_utc)} mono />
          <Field label="INGESTED"   value={fmt(event.created_at)}         mono />
        </div>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <Section label="TAGS">
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map(t => (
                <span key={t} className="font-mono text-[9px] text-ink-2 bg-bg-4 border border-line px-2 py-0.5 rounded-sm">
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Flags */}
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {event.verified          && <Flag label="VERIFIED"             color="#22c55e" />}
          {event.contradiction_flag && <Flag label="CONTRADICTION FLAGGED" color="#a855f7" />}
          {event.related_event_id  && <Flag label="LINKED EVENT"         color="#3b82f6" />}
        </div>
      </div>
    </>
  );
}

function ScoreBlock({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 py-3">
      <span className="font-mono text-xl font-medium leading-none" style={{ color }}>{value}</span>
      <span className="font-mono text-[8px] tracking-widest text-ink-3">{label}</span>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="px-4 py-3 border-b border-line">
      <div className="font-mono text-[8px] tracking-widest text-ink-3 mb-2">{label}</div>
      {children}
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="px-4 py-2.5 border-r border-b border-line last:border-r-0 [&:nth-child(even)]:border-r-0">
      <div className="font-mono text-[8px] tracking-widest text-ink-3 mb-1">{label}</div>
      <div className={`text-[11px] text-ink-1 ${mono ? 'font-mono text-[10px]' : ''}`}>{String(value)}</div>
    </div>
  );
}

function ActorChip({ name }) {
  return (
    <span className="font-mono text-[10px] text-cyan border border-cyan/20 bg-cyan/6 px-2 py-1 rounded-sm">
      {name}
    </span>
  );
}

function Flag({ label, color }) {
  return (
    <span
      className="font-mono text-[8px] tracking-widest px-2 py-1 border rounded-sm"
      style={{ color, borderColor: color + '55', background: color + '12' }}
    >
      {label}
    </span>
  );
}