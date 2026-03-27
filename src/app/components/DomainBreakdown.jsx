'use client';

const DOMAIN_COLOR = {
  military: '#e84040', political: '#3b82f6', humanitarian: '#22c55e',
  cyber: '#06b6d4', economic: '#f5a623',
};

const TYPE_ICON = {
  airstrike: '✈', missile_attack: '⬆', drone_attack: '◈',
  diplomatic: '◉', sanctions: '⊘', military_movement: '▶',
  statement: '◎', cyber: '⌖', humanitarian: '✚', other: '·',
};

export default function DomainBreakdown({ domainCounts = {}, typeCounts = {}, totalEvents = 0 }) {
  const domains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
  const types   = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxD    = Math.max(...Object.values(domainCounts), 1);
  const maxT    = Math.max(...Object.values(typeCounts), 1);

  return (
    <div className="flex flex-col gap-0 h-full overflow-y-auto py-2">

      {/* By Domain */}
      <div className="px-3 mb-1">
        <div className="font-mono text-[8px] tracking-widest text-ink-3 mb-2">BY DOMAIN</div>
        <div className="flex flex-col gap-1.5">
          {domains.map(([domain, count]) => (
            <BarRow
              key={domain}
              label={domain.toUpperCase()}
              count={count}
              pct={count / maxD}
              color={DOMAIN_COLOR[domain] || '#5a6a82'}
              rightLabel={totalEvents ? `${Math.round(count / totalEvents * 100)}%` : ''}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-line my-2" />

      {/* By Event Type */}
      <div className="px-3">
        <div className="font-mono text-[8px] tracking-widest text-ink-3 mb-2">BY EVENT TYPE</div>
        <div className="flex flex-col gap-1.5">
          {types.map(([type, count]) => (
            <BarRow
              key={type}
              icon={TYPE_ICON[type] || '·'}
              label={type.replace(/_/g, ' ')}
              count={count}
              pct={count / maxT}
              color="#3b82f6"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BarRow({ icon, label, count, pct, color, rightLabel }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-[10px] text-ink-2 w-3 text-center shrink-0">{icon}</span>}
      <span
        className="font-mono text-[8px] shrink-0 w-20 truncate"
        style={{ color: icon ? undefined : color, fontWeight: icon ? 400 : 500 }}
      >
        {label}
      </span>
      <div className="flex-1 h-1 bg-bg-4 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct * 100}%`, background: color + 'aa' }} />
      </div>
      <span className="font-mono text-[10px] text-ink-1 w-6 text-right shrink-0">{count}</span>
      {rightLabel && <span className="font-mono text-[8px] text-ink-3 w-7 text-right shrink-0">{rightLabel}</span>}
    </div>
  );
}