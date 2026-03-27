'use client';

const DOMAIN = {
  military:     { color: '#ff5370', bg: 'rgba(255,83,112,0.14)',  border: 'rgba(255,83,112,0.3)'  },
  political:    { color: '#4d94ff', bg: 'rgba(77,148,255,0.14)',  border: 'rgba(77,148,255,0.3)'  },
  humanitarian: { color: '#2ecc8e', bg: 'rgba(46,204,142,0.12)',  border: 'rgba(46,204,142,0.28)' },
  cyber:        { color: '#3ddcff', bg: 'rgba(61,220,255,0.12)',  border: 'rgba(61,220,255,0.28)' },
  economic:     { color: '#ffaa3b', bg: 'rgba(255,170,59,0.14)',  border: 'rgba(255,170,59,0.3)'  },
};

function sevStyle(s) {
  if (s >= 8.5) return { color: '#ff5370', bg: 'rgba(255,83,112,0.14)',  border: 'rgba(255,83,112,0.32)' };
  if (s >= 6.5) return { color: '#ffaa3b', bg: 'rgba(255,170,59,0.14)',  border: 'rgba(255,170,59,0.32)' };
  if (s >= 4)   return { color: '#ffd166', bg: 'rgba(255,209,102,0.12)', border: 'rgba(255,209,102,0.28)' };
  return              { color: '#2ecc8e', bg: 'rgba(46,204,142,0.1)',   border: 'rgba(46,204,142,0.25)' };
}

function sevLabel(s) {
  return s >= 8.5 ? 'Critical' : s >= 6.5 ? 'High' : s >= 4 ? 'Medium' : 'Low';
}

export function DomainBadge({ domain }) {
  const d = DOMAIN[domain] || { color: '#adbedd', bg: 'rgba(45,59,82,0.6)', border: 'rgba(46,61,88,0.8)' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold capitalize
        transition-all duration-200 hover:scale-105 animate-fade-in-scale"
      style={{ color: d.color, background: d.bg, borderColor: d.border }}
    >
      {domain || 'unknown'}
    </span>
  );
}

export function SeverityBadge({ score }) {
  const s = score || 0;
  const d = sevStyle(s);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold
        animate-fade-in-scale"
      style={{ color: d.color, background: d.bg, borderColor: d.border }}
    >
      <span className="font-mono">{s.toFixed(1)}</span>
      <span style={{ opacity: 0.65, fontSize: 10 }}>{sevLabel(s)}</span>
    </span>
  );
}

export function EscalationBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold
        animate-fade-in-scale"
      style={{
        color: '#ffaa3b',
        background: 'rgba(255,170,59,0.14)',
        borderColor: 'rgba(255,170,59,0.32)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-current pulse-dot"
        style={{ boxShadow: '0 0 5px #ffaa3b' }}
      />
      Escalation
    </span>
  );
}

export function ThreatBadge({ level }) {
  const MAP = {
    CRITICAL: { color: '#ff5370', bg: 'rgba(255,83,112,0.15)',  border: 'rgba(255,83,112,0.35)' },
    HIGH:     { color: '#ffaa3b', bg: 'rgba(255,170,59,0.15)',  border: 'rgba(255,170,59,0.35)' },
    ELEVATED: { color: '#ffd166', bg: 'rgba(255,209,102,0.12)', border: 'rgba(255,209,102,0.3)' },
    LOW:      { color: '#2ecc8e', bg: 'rgba(46,204,142,0.12)',  border: 'rgba(46,204,142,0.28)' },
  };
  const d = MAP[level] || MAP.LOW;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold"
      style={{ color: d.color, background: d.bg, borderColor: d.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
      {level}
    </span>
  );
}