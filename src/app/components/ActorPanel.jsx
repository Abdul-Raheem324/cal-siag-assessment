'use client';

const THREAT_COLOR = { critical: '#e84040', high: '#f5a623', medium: '#facc15', low: '#22c55e' };
const TYPE_SHORT   = { military: 'MIL', government: 'GOV', militia: 'MIL-NG', international_org: 'INTL', media: 'MEDIA', other: '—' };

export default function ActorPanel({ actors = [], onSelect, selectedActor }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-line shrink-0">
        <span className="font-mono text-[9px] font-semibold tracking-widest text-ink-1">ACTORS</span>
        <span className="font-mono text-[8px] text-ink-3">{actors.length} tracked</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {actors.map(actor => {
          const tc = THREAT_COLOR[actor.threat_level] || '#5a6a82';
          const selected = selectedActor?.name === actor.name;
          return (
            <div
              key={actor.id}
              onClick={() => onSelect?.(actor)}
              className={`flex items-stretch border-b border-line cursor-pointer transition-colors ${selected ? 'bg-bg-3' : 'hover:bg-bg-2'}`}
            >
              {/* Threat bar */}
              <div className="w-[3px] shrink-0 opacity-70" style={{ background: tc }} />
              <div className="flex-1 px-3 py-2 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] font-semibold text-ink-0">{actor.name}</span>
                  <span className="font-mono text-[8px]" style={{ color: tc + 'cc' }}>
                    {TYPE_SHORT[actor.actor_type] || actor.actor_type}
                  </span>
                  <span className="font-mono text-[8px] text-ink-3 ml-auto">{actor.country}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-ink-2 truncate">{actor.full_name}</span>
                  <span className="font-mono text-[8px] text-ink-3 shrink-0 ml-2">{actor.event_count || 0} ev</span>
                </div>
              </div>
              {/* Threat pill */}
              <div className="flex items-center pr-2">
                <span
                  className="font-mono text-[7px] tracking-widest px-1.5 py-0.5 border rounded-sm"
                  style={{ color: tc, borderColor: tc + '40', background: tc + '12' }}
                >
                  {actor.threat_level?.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}