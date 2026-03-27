'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const Graph = dynamic(() => import('../components/ActorGraph'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-sm" style={{ color: '#627a9e' }}>
      Loading graph…
    </div>
  ),
});

const THREAT = {
  critical: { text: '#ff5370', bg: 'rgba(255,83,112,0.13)',  border: 'rgba(255,83,112,0.35)' },
  high:     { text: '#ffaa3b', bg: 'rgba(255,170,59,0.13)',  border: 'rgba(255,170,59,0.35)' },
  medium:   { text: '#ffd166', bg: 'rgba(255,209,102,0.11)', border: 'rgba(255,209,102,0.3)' },
  low:      { text: '#2ecc8e', bg: 'rgba(46,204,142,0.11)',  border: 'rgba(46,204,142,0.28)' },
};

function SectionCard({ children, noPad = false, style = {}, className = '' }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${className}`}
      style={{ background: '#171e2c', borderColor: '#2e3d58', boxShadow: '0 2px 14px rgba(0,0,0,0.3)', ...style }}>
      {noPad ? children : <div className="p-4">{children}</div>}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="px-4 py-3 border-b" style={{ background: '#1f2840', borderColor: '#2e3d58' }}>
      <h3 className="text-sm font-semibold" style={{ color: '#f1f5ff' }}>{title}</h3>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: '#627a9e' }}>{subtitle}</p>}
    </div>
  );
}

export default function ActorsView({ actors, relations }) {
  const [selected, setSelected] = useState(null);

  const selectedRelations = selected
    ? relations.filter(r => r.actor_1 === selected.name || r.actor_2 === selected.name)
    : [];

  return (
    <div className="space-y-4">

      {/* Graph */}
      <SectionCard noPad className="animate-fade-in-up">
        <SectionHeader
          title="Actor Relationship Graph"
          subtitle="Click an actor to inspect · Drag to rearrange · Scroll to zoom"
        />
        <div className="h-96">
          <Graph actors={actors} relations={relations} onSelect={setSelected} selected={selected} />
        </div>
        <div className="flex items-center gap-4 px-4 py-3 border-t flex-wrap"
          style={{ background: '#1a2236', borderColor: '#2e3d58' }}>
          {[
            { color: '#ff5370', label: 'Military' },
            { color: '#4d94ff', label: 'Political' },
            { color: '#2ecc8e', label: 'Humanitarian' },
            { color: '#3ddcff', label: 'Cyber' },
            { color: '#ffaa3b', label: 'Economic' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: '#adbedd' }}>
              <span className="w-5 h-0.5 rounded-full"
                style={{ background: l.color, boxShadow: `0 0 5px ${l.color}70` }} />
              {l.label}
            </div>
          ))}
          <span className="text-xs ml-auto hidden sm:block" style={{ color: '#5d7599' }}>
            Node size = event count · Edge thickness = frequency
          </span>
        </div>
      </SectionCard>

      {/* Actor list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <SectionCard noPad>
            <SectionHeader title="Tracked Actors" subtitle={`${actors.length} actors monitored`} />
            <div className="divide-y" style={{ borderColor: '#2e3d58' }}>
              {actors.map((actor, i) => {
                const tc       = THREAT[actor.threat_level] || THREAT.low;
                const isSel    = selected?.name === actor.name;
                return (
                  <button key={actor.id}
                    onClick={() => setSelected(isSel ? null : actor)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-left cursor-pointer
                      transition-all duration-200 relative animate-fade-in-up"
                    style={{
                      animationDelay: `${Math.min(i * 28, 280)}ms`,
                      background: isSel ? tc.bg : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#1f2840'; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Active accent */}
                    {isSel && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                        style={{ background: tc.text, boxShadow: `0 0 8px ${tc.text}` }} />
                    )}

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border"
                      style={{ background: tc.bg, borderColor: tc.border, color: tc.text }}>
                      {actor.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: '#f1f5ff' }}>{actor.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md border font-semibold"
                          style={{ background: tc.bg, color: tc.text, borderColor: tc.border }}>
                          {actor.threat_level?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#627a9e' }}>{actor.full_name}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono font-bold"
                        style={{ color: isSel ? tc.text : '#f1f5ff' }}>
                        {actor.event_count || 0}
                      </p>
                      <p className="text-[10px]" style={{ color: '#627a9e' }}>events</p>
                    </div>

                    <div className="text-xs capitalize shrink-0 hidden sm:block w-20"
                      style={{ color: '#627a9e' }}>
                      {actor.country}
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Actor detail */}
        <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          {selected ? (
            <div className="rounded-xl border overflow-hidden"
              style={{
                background: '#171e2c',
                borderColor: THREAT[selected.threat_level]?.border || '#2e3d58',
                boxShadow: `0 4px 24px ${THREAT[selected.threat_level]?.bg || 'rgba(0,0,0,0.3)'}`,
              }}>
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ background: '#1f2840', borderColor: '#2e3d58' }}>
                <h3 className="text-sm font-semibold" style={{ color: '#f1f5ff' }}>{selected.name}</h3>
                <button onClick={() => setSelected(null)}
                  className="text-xs w-6 h-6 flex items-center justify-center rounded-md cursor-pointer transition-all"
                  style={{ color: '#627a9e' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#2e3d58'; e.currentTarget.style.color = '#f1f5ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#627a9e'; }}>
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Threat badge */}
                {(() => {
                  const tc = THREAT[selected.threat_level] || THREAT.low;
                  return (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                      style={{ background: tc.bg, color: tc.text, borderColor: tc.border }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
                      {selected.threat_level?.toUpperCase()} THREAT
                    </div>
                  );
                })()}

                {/* Info */}
                <div className="space-y-2">
                  {[
                    { label: 'Full Name', value: selected.full_name },
                    { label: 'Country',   value: selected.country },
                    { label: 'Type',      value: selected.actor_type },
                    { label: 'Events',    value: selected.event_count || 0 },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 border"
                      style={{ background: '#1f2840', borderColor: '#2e3d58' }}>
                      <span className="text-xs" style={{ color: '#627a9e' }}>{f.label}</span>
                      <span className="text-xs font-medium capitalize text-right" style={{ color: '#adbedd' }}>{f.value || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Relations */}
                {selectedRelations.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#627a9e' }}>Interactions</p>
                    <div className="space-y-1.5">
                      {selectedRelations.slice(0, 6).map((r, i) => {
                        const other = r.actor_1 === selected.name ? r.actor_2 : r.actor_1;
                        return (
                          <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 border"
                            style={{ background: '#1f2840', borderColor: '#2e3d58' }}>
                            <span className="text-xs" style={{ color: '#adbedd' }}>{other}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] capitalize" style={{ color: '#627a9e' }}>{r.interaction_type}</span>
                              <span className="text-xs font-mono font-semibold" style={{ color: '#4d94ff' }}>×{r.interaction_count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selected.description && (
                  <p className="text-xs leading-relaxed pt-3 border-t"
                    style={{ color: '#627a9e', borderColor: '#2e3d58' }}>
                    {selected.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border p-5" style={{ background: '#171e2c', borderColor: '#2e3d58' }}>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 border"
                  style={{ background: '#1f2840', borderColor: '#2e3d58' }}>
                  <svg className="w-5 h-5" style={{ color: '#5d7599' }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
                    <line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/>
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: '#adbedd' }}>Select an actor</p>
                <p className="text-xs mt-1" style={{ color: '#627a9e' }}>
                  Click on the list or graph to inspect relationships
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}