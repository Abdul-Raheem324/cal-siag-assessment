'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { CardHeader, StatCard } from './ui/Cards';

const STAT_CARDS = stats => [
  { label: 'Total Events',       value: stats?.totalEvents     ?? '—', sub: 'All ingested events',      icon: '📋', accentColor: '#4d94ff' },
  { label: 'Escalation Signals', value: stats?.escalationCount ?? '—', sub: 'Flagged high-urgency',     icon: '⚡', accentColor: '#ffaa3b' },
  { label: 'Avg Severity',       value: stats?.avgSeverity ? `${stats.avgSeverity}/10` : '—',
    sub: 'Across all events', icon: '📊', accentColor: stats?.avgSeverity >= 6 ? '#ff5370' : '#2ecc8e' },
  { label: 'Avg Confidence',     value: stats?.avgConfidence ? `${stats.avgConfidence}/10` : '—',
    sub: 'Source reliability', icon: '🎯', accentColor: '#b880ff' },
];

const DOMAIN_COLORS = {
  military: '#ff5370', political: '#4d94ff', humanitarian: '#2ecc8e',
  cyber: '#3ddcff', economic: '#ffaa3b',
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border rounded-xl px-3 py-2.5 text-xs"
      style={{ background: '#1f2840', borderColor: '#2e3d58', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <p className="mb-2 font-medium" style={{ color: '#627a9e' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-5 mb-1 last:mb-0">
          <span style={{ color: '#adbedd' }} className="capitalize">{p.name}</span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function SectionCard({ children }) {
  return (
    <div className="rounded-xl border p-5 animate-fade-in-up"
      style={{ background: '#171e2c', borderColor: '#2e3d58', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
      {children}
    </div>
  );
}

export default function OverviewView({ stats }) {
  const timeline    = stats?.timeline     || [];
  const domainCounts = stats?.domainCounts || {};
  const domainData   = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, color: DOMAIN_COLORS[name] || '#5d7599' }));

  return (
    <div className="space-y-5">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {STAT_CARDS(stats).map((c, i) => (
          <StatCard key={c.label} {...c} delay={i * 60} />
        ))}
      </div>

      {/* Timeline */}
      <SectionCard>
        <CardHeader title="Escalation Timeline" subtitle="14-day event severity and volume" />
        {timeline.length > 0 ? (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#ff5370" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ff5370" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#4d94ff" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#4d94ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#263147" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="date"
                  tickFormatter={d => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}`; }}
                  tick={{ fill: '#5d7599', fontSize: 10, fontFamily: 'Geist Mono' }}
                  axisLine={{ stroke: '#263147' }} tickLine={false} interval="preserveStartEnd" />
                <YAxis yAxisId="sev" domain={[0,10]}
                  tick={{ fill: '#5d7599', fontSize: 10, fontFamily: 'Geist Mono' }}
                  axisLine={false} tickLine={false} />
                <YAxis yAxisId="cnt" orientation="right"
                  tick={{ fill: '#5d7599', fontSize: 10, fontFamily: 'Geist Mono' }}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#2e3d58', strokeWidth: 1 }} />
                <Area yAxisId="cnt" type="monotone" dataKey="count"
                  stroke="#4d94ff" strokeWidth={2} fill="url(#gCnt)" dot={false} name="Events" />
                <Area yAxisId="sev" type="monotone" dataKey="avgSeverity"
                  stroke="#ff5370" strokeWidth={2} fill="url(#gSev)" dot={false} name="Severity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-52 flex items-center justify-center text-sm" style={{ color: '#5d7599' }}>
            No timeline data yet
          </div>
        )}
        <div className="flex items-center gap-5 mt-3 pt-3 border-t" style={{ borderColor: '#2e3d58' }}>
          {[{ color: '#ff5370', label: 'Avg Severity' }, { color: '#4d94ff', label: 'Event Count' }].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-xs" style={{ color: '#adbedd' }}>
              <span className="w-5 h-0.5 rounded-full inline-block"
                style={{ background: l.color, boxShadow: `0 0 5px ${l.color}70` }} />
              {l.label}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Domain + Event type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <SectionCard>
          <CardHeader title="Events by Domain" subtitle="Distribution across categories" />
          {domainData.length > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainData} layout="vertical" margin={{ top:0, right:32, left:0, bottom:0 }}>
                  <CartesianGrid stroke="#263147" strokeDasharray="3 6" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#5d7599', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category"
                    tick={{ fill: '#adbedd', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(38,49,71,0.5)' }} />
                  <Bar dataKey="value" radius={[0,6,6,0]} name="Events">
                    {domainData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-sm" style={{ color: '#5d7599' }}>No data</div>
          )}
        </SectionCard>

        <SectionCard>
          <CardHeader title="Event Types" subtitle="Top categories by frequency" />
          <div className="space-y-3">
            {Object.entries(stats?.typeCounts || {})
              .sort((a, b) => b[1] - a[1])
              .slice(0, 7)
              .map(([type, count], i) => {
                const total = stats?.totalEvents || 1;
                const pct   = Math.round((count / total) * 100);
                const hues  = [210, 270, 155, 190, 38, 0, 290];
                const color = `hsl(${hues[i % 7]}, 75%, 65%)`;
                return (
                  <div key={type} className="flex items-center gap-3 group animate-fade-in-up"
                    style={{ animationDelay: `${i * 35}ms` }}>
                    <span className="text-xs capitalize w-32 shrink-0 truncate transition-colors"
                      style={{ color: '#adbedd' }}>
                      {type.replace(/_/g, ' ')}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: '#1f2840' }}>
                      <div className="h-full rounded-full bar-fill"
                        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 5px ${color}60` }} />
                    </div>
                    <span className="text-xs font-mono w-8 text-right" style={{ color: '#627a9e' }}>{count}</span>
                  </div>
                );
              })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}