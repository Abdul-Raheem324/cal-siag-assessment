'use client';

const TIER = {
  1: { label: 'Tier 1', desc: 'Reuters, AP, BBC',      color: '#2ecc8e', bg: 'rgba(46,204,142,0.12)',  border: 'rgba(46,204,142,0.3)'  },
  2: { label: 'Tier 2', desc: 'Guardian, Al Jazeera',  color: '#4d94ff', bg: 'rgba(77,148,255,0.12)',  border: 'rgba(77,148,255,0.3)'  },
  3: { label: 'Tier 3', desc: 'Regional media',         color: '#ffaa3b', bg: 'rgba(255,170,59,0.12)',  border: 'rgba(255,170,59,0.3)'  },
  4: { label: 'Tier 4', desc: 'Social / Blog',          color: '#ff5370', bg: 'rgba(255,83,112,0.12)',  border: 'rgba(255,83,112,0.3)'  },
};

function confColor(s) {
  if (s >= 7) return '#2ecc8e';
  if (s >= 5) return '#ffaa3b';
  return '#ff5370';
}

export default function SourcesView({ events }) {
  const sourceMap = {};
  (events || []).forEach(ev => {
    const key = ev.source_name || 'Unknown';
    if (!sourceMap[key]) {
      sourceMap[key] = { name: key, tier: ev.source_tier || 4, type: ev.source_type || '—',
        count: 0, totalConf: 0, totalSev: 0, domains: {} };
    }
    sourceMap[key].count++;
    sourceMap[key].totalConf += ev.confidence_score || 0;
    sourceMap[key].totalSev  += ev.severity_score   || 0;
    if (ev.domain) sourceMap[key].domains[ev.domain] = (sourceMap[key].domains[ev.domain] || 0) + 1;
  });

  const sources = Object.values(sourceMap)
    .sort((a, b) => b.count - a.count)
    .map(s => ({
      ...s,
      avgConf: s.count ? (s.totalConf / s.count).toFixed(1) : 0,
      avgSev:  s.count ? (s.totalSev  / s.count).toFixed(1) : 0,
      topDomain: Object.entries(s.domains).sort((a, b) => b[1] - a[1])[0]?.[0] || '—',
    }));

  const totalByTier = { 1: 0, 2: 0, 3: 0, 4: 0 };
  sources.forEach(s => { if (totalByTier[s.tier] !== undefined) totalByTier[s.tier] += s.count; });
  const grand = Object.values(totalByTier).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-4">

      {/* Tier cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {[1, 2, 3].map((tier, i) => {
          const ti    = TIER[tier];
          const count = totalByTier[tier];
          const pct   = Math.round((count / grand) * 100);
          return (
            <div key={tier}
              className="rounded-xl border p-5 relative overflow-hidden group cursor-default
                transition-all duration-250 animate-fade-in-up"
              style={{
                background: '#171e2c', borderColor: ti.border,
                boxShadow: `0 2px 14px rgba(0,0,0,0.3)`,
                animationDelay: `${i * 60}ms`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 0 1px ${ti.border}, 0 4px 20px rgba(0,0,0,0.4)`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.3)'; }}
            >
              {/* Corner glow */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(circle, ${ti.color} 0%, transparent 70%)` }} />

              <div className="inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold mb-3"
                style={{ background: ti.bg, color: ti.color, borderColor: ti.border }}>
                {ti.label}
              </div>
              <p className="text-3xl font-bold font-mono mb-1"
                style={{ color: ti.color }}>
                {pct}%
              </p>
              <p className="text-xs" style={{ color: `${ti.color}90` }}>
                {count} events · {ti.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Source table */}
      <div className="rounded-xl border overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '200ms', background: '#171e2c', borderColor: '#2e3d58', boxShadow: '0 2px 14px rgba(0,0,0,0.3)' }}>

        <div className="p-4 border-b" style={{ background: '#1f2840', borderColor: '#2e3d58' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#f1f5ff' }}>Source Breakdown</h3>
          <p className="text-xs mt-0.5" style={{ color: '#627a9e' }}>{sources.length} sources · sorted by event count</p>
        </div>

        {/* Header row */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 border-b
          text-[10px] font-semibold uppercase tracking-widest"
          style={{ background: '#1a2236', borderColor: '#2e3d58', color: '#5d7599' }}>
          <span className="col-span-4">Source</span>
          <span className="col-span-2">Tier / Type</span>
          <span className="col-span-1 text-right">Events</span>
          <span className="col-span-2 text-right">Avg Conf</span>
          <span className="col-span-2 text-right">Avg Sev</span>
          <span className="col-span-1">Domain</span>
        </div>

        <div className="divide-y stagger" style={{ borderColor: '#2e3d58' }}>
          {sources.map((s, i) => {
            const ti   = TIER[s.tier] || TIER[4];
            const conf = parseFloat(s.avgConf);
            const cc   = confColor(conf);
            return (
              <div key={s.name}
                className="grid md:grid-cols-12 gap-3 px-4 py-3 items-center
                  transition-all duration-200 cursor-default animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 25, 350)}ms` }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1f2840'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                <div className="md:col-span-4 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 border"
                    style={{ background: '#1f2840', borderColor: '#2e3d58', color: '#5d7599' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium truncate" style={{ color: '#d4e0f5' }}>{s.name}</span>
                </div>

                <div className="md:col-span-2 flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded border font-semibold"
                    style={{ background: ti.bg, color: ti.color, borderColor: ti.border }}>
                    T{s.tier}
                  </span>
                  <span className="text-xs hidden lg:block capitalize" style={{ color: '#627a9e' }}>{s.type}</span>
                </div>

                <div className="md:col-span-1 text-right font-mono text-sm font-bold" style={{ color: '#f1f5ff' }}>
                  {s.count}
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <div className="w-12 h-1.5 rounded-full overflow-hidden hidden md:block"
                    style={{ background: '#1f2840', border: '1px solid #2e3d58' }}>
                    <div className="h-full rounded-full bar-fill"
                      style={{ width: `${conf * 10}%`, background: cc }} />
                  </div>
                  <span className="font-mono text-xs font-semibold" style={{ color: cc }}>{s.avgConf}</span>
                </div>

                <div className="md:col-span-2 text-right">
                  <span className="font-mono text-xs font-semibold" style={{ color: '#adbedd' }}>{s.avgSev}</span>
                </div>

                <div className="md:col-span-1">
                  <span className="text-xs capitalize" style={{ color: '#627a9e' }}>{s.topDomain}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}