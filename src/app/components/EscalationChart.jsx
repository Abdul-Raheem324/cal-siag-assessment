'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';

function shortDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}`;
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-bg-3 border border-line-hi rounded-sm px-3 py-2 shadow-xl">
      <div className="font-mono text-[9px] text-ink-2 mb-2 pb-1.5 border-b border-line">{d?.date}</div>
      <div className="flex justify-between gap-4 font-mono text-[10px] mb-1">
        <span className="text-ink-2">Events</span>
        <span className="text-blue">{d?.count}</span>
      </div>
      <div className="flex justify-between gap-4 font-mono text-[10px] mb-1">
        <span className="text-ink-2">Avg Severity</span>
        <span style={{ color: (d?.avgSeverity || 0) >= 6.5 ? '#e84040' : '#f5a623' }}>{d?.avgSeverity}</span>
      </div>
      {d?.escalations > 0 && (
        <div className="flex justify-between gap-4 font-mono text-[10px]">
          <span className="text-ink-2">Escalations</span>
          <span className="text-amber">⚡ {d.escalations}</span>
        </div>
      )}
    </div>
  );
};

export default function EscalationChart({ timeline = [] }) {
  if (!timeline.length) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-[10px] text-ink-3 tracking-widest">
        NO TIMELINE DATA
      </div>
    );
  }

  const maxEscDay = timeline.reduce((m, d) => d.escalations > (m?.escalations || 0) ? d : m, null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-line shrink-0">
        <span className="font-mono text-[9px] font-semibold tracking-widest text-ink-1">ESCALATION TIMELINE</span>
        <span className="font-mono text-[8px] text-ink-3">14-day · ⚡ = escalation spike</span>
      </div>

      <div className="flex-1 min-h-0 px-1 pt-2 pb-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gSev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#e84040" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#e84040" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gCnt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#1a2030" strokeDasharray="2 4" />

            <XAxis dataKey="date" tickFormatter={shortDate}
              tick={{ fill: '#303d52', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: '#1a2030' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis yAxisId="sev" domain={[0, 10]}
              tick={{ fill: '#303d52', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
              axisLine={false} tickLine={false} />
            <YAxis yAxisId="cnt" orientation="right"
              tick={{ fill: '#303d52', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
              axisLine={false} tickLine={false} />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#283350', strokeWidth: 1 }} />

            <ReferenceLine yAxisId="sev" y={6.5}
              stroke="#e84040" strokeDasharray="3 4" strokeOpacity={0.25}
              label={{ value: 'HIGH', fill: '#e84040', fontSize: 8, fontFamily: 'IBM Plex Mono', position: 'right' }} />

            {maxEscDay && (
              <ReferenceLine yAxisId="sev" x={maxEscDay.date}
                stroke="#f5a623" strokeDasharray="2 3" strokeOpacity={0.4}
                label={{ value: '⚡', fill: '#f5a623', fontSize: 10, position: 'top' }} />
            )}

            <Area yAxisId="cnt" type="monotone" dataKey="count"
              stroke="#3b82f6" strokeWidth={1} fill="url(#gCnt)"
              dot={false} activeDot={{ r: 3, fill: '#3b82f6' }} />
            <Area yAxisId="sev" type="monotone" dataKey="avgSeverity"
              stroke="#e84040" strokeWidth={1.5} fill="url(#gSev)"
              dot={false} activeDot={{ r: 3, fill: '#e84040' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 px-3 pb-2 shrink-0">
        {[
          { color: '#e84040', label: '— Avg Severity' },
          { color: '#3b82f6', label: '— Event Count' },
          { color: '#f5a623', label: '⚡ Escalation Spike' },
        ].map(l => (
          <span key={l.label} className="font-mono text-[8px]" style={{ color: l.color }}>{l.label}</span>
        ))}
      </div>
    </div>
  );
}