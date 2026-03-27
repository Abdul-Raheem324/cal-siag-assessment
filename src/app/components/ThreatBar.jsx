'use client'
import { useState, useEffect } from 'react'

const THREAT_CONFIG = {
  GREEN:  { label: 'NORMAL',   color: 'var(--color-threat-green)',  bgClass: 'bg-green-950/40',  blip: false },
  YELLOW: { label: 'ELEVATED', color: 'var(--color-threat-amber)',  bgClass: 'bg-yellow-950/40', blip: false },
  ORANGE: { label: 'HIGH',     color: 'var(--color-threat-orange)', bgClass: 'bg-orange-950/40', blip: true  },
  RED:    { label: 'CRITICAL', color: 'var(--color-threat-red)',    bgClass: 'bg-red-950/40',    blip: true  },
}

const FILTERS = [
  { key: 'all',          label: 'ALL' },
  { key: 'military',     label: 'MIL' },
  { key: 'political',    label: 'POL' },
  { key: 'escalation',   label: 'ESC' },
  { key: 'humanitarian', label: 'HUM' },
  { key: 'economic',     label: 'ECO' },
]

export default function ThreatBar({ stats, lastRefresh, onRefresh, activeFilter, setActiveFilter }) {
  const [clock,  setClock]  = useState('')
  const [blipOn, setBlipOn] = useState(true)

  useEffect(() => {
    const tick = () => setClock(new Date().toUTCString().slice(17, 25) + ' UTC')
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setBlipOn(b => !b), 800)
    return () => clearInterval(id)
  }, [])

  const level      = stats?.threat_level || 'YELLOW'
  const cfg        = THREAT_CONFIG[level] || THREAT_CONFIG.YELLOW
  const events24h  = stats?.events_24h       || 0
  const escalCount = stats?.escalation_count  || 0
  const activeSrcs = stats?.active_sources    || 0

  return (
    <header
      className={`flex items-center h-11 shrink-0 select-none text-[11px] tracking-wide`}
      style={{ background: 'var(--color-surface)', borderBottom: `1px solid ${cfg.color}33` }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 h-full min-w-[200px]"
        style={{ borderRight: '1px solid var(--color-border)' }}>
        <span className="text-sm font-bold" style={{ color: 'var(--color-threat-red)' }}>▲</span>
        <span className="font-semibold tracking-[3px] text-[11px]" style={{ color: 'var(--color-bright)' }}>SAIG</span>
        <span className="text-[10px]" style={{ color: 'var(--color-dim)' }}>OSINT</span>
      </div>

      {/* Threat level */}
      <div className={`flex items-center gap-2.5 px-5 h-full ${cfg.bgClass}`}
        style={{ borderRight: '1px solid var(--color-border)' }}>
        <span
          className="w-2 h-2 rounded-full transition-opacity duration-200"
          style={{
            background: cfg.color,
            boxShadow: `0 0 6px ${cfg.color}`,
            opacity: cfg.blip ? (blipOn ? 1 : 0.15) : 1,
          }}
        />
        <span className="text-[10px]" style={{ color: 'var(--color-dim)' }}>THREAT</span>
        <span className="font-bold text-[12px]" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 px-4 h-full"
        style={{ borderRight: '1px solid var(--color-border)' }}>
        <Stat label="24H EVENTS" value={events24h}  />
        <Stat label="ESCALATION" value={escalCount} warn={escalCount > 5} />
        <Stat label="SOURCES"    value={activeSrcs} />
      </div>

      {/* Domain filters */}
      <div className="flex items-center gap-1.5 px-3 h-full flex-1"
        style={{ borderRight: '1px solid var(--color-border)' }}>
        {FILTERS.map(f => {
          const active = activeFilter === f.key
          return (
            <button key={f.key} onClick={() => setActiveFilter(f.key)}
              className="px-2.5 py-0.5 text-[10px] tracking-wide rounded-sm border transition-all duration-150 cursor-pointer"
              style={{
                fontFamily: 'var(--font-mono)',
                background:   active ? `${cfg.color}18` : 'transparent',
                borderColor:  active ? cfg.color : 'var(--color-border)',
                color:        active ? cfg.color : 'var(--color-dim)',
              }}
            >{f.label}</button>
          )
        })}
      </div>

      {/* Clock */}
      <div className="flex items-center gap-4 px-4 h-full">
        {lastRefresh && (
          <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
            SYNC {lastRefresh.toISOString().slice(11, 19)}Z
          </span>
        )}
        <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-dim)' }}>{clock}</span>
        <button onClick={onRefresh} title="Refresh (Ctrl+R)"
          className="px-2 py-0.5 text-[10px] rounded-sm border transition-colors cursor-pointer"
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'transparent',
            borderColor: 'var(--color-border)',
            color: 'var(--color-dim)',
          }}
        >↺</button>
      </div>
    </header>
  )
}

function Stat({ label, value, warn }) {
  return (
    <div className="flex flex-col gap-0.5 leading-none">
      <span className="text-[9px] tracking-wide" style={{ color: 'var(--color-muted)' }}>{label}</span>
      <span className="text-[13px] font-bold tabular-nums"
        style={{ color: warn ? 'var(--color-threat-orange)' : 'var(--color-dim)' }}>
        {value}
      </span>
    </div>
  )
}