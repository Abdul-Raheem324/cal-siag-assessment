'use client'
import { useState, useEffect } from 'react'

export default function SituationBrief({ stats, events }) {
  const [brief,   setBrief]   = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!stats || !events.length) return
    const topEvent  = events.find(e => e.severity_score >= 8)
    const escCount  = events.filter(e => e.is_escalation_signal).length
    const milCount  = events.filter(e => e.domain === 'military').length
    setBrief({
      top_actors: stats.top_actors || [],
      lines: [
        `${milCount} military events in last 24h.`,
        `${escCount} escalation signal${escCount !== 1 ? 's' : ''} detected.`,
        topEvent ? `Highest: ${topEvent.event_type?.replace('_',' ')} in ${topEvent.country} (${topEvent.severity_score}/10).` : 'No critical events in current window.',
        stats.top_country ? `Most active theater: ${stats.top_country}.` : '',
      ].filter(Boolean),
    })
  }, [stats, events])

  const generateAI = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/brief', { method: 'POST' })
      const data = await res.json()
      if (data.brief) setBrief(p => ({ ...p, ai_text: data.brief }))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: 'var(--font-mono)' }}>
      <div className="flex justify-between items-center px-3 py-1.5 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-[10px] tracking-widest" style={{ color: 'var(--color-dim)' }}>SITUATION BRIEF</span>
        <button onClick={generateAI} disabled={loading}
          className="px-2 py-px text-[9px] tracking-wide rounded-sm border transition-colors cursor-pointer"
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'transparent',
            borderColor: 'var(--color-border)',
            color: loading ? 'var(--color-muted)' : 'var(--color-domain-political)',
          }}>
          {loading ? 'GENERATING...' : '⚡ AI BRIEF'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3">
        {!brief
          ? <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>AWAITING DATA...</p>
          : <>
            {brief.ai_text
              ? <p className="text-[10px] leading-relaxed pl-2"
                  style={{ color: 'var(--color-mid)', borderLeft: '2px solid rgb(59 130 246 / 0.3)' }}>
                  {brief.ai_text}
                </p>
              : <div className="space-y-1.5">
                  {brief.lines.map((line, i) => (
                    <div key={i} className="flex gap-2 text-[10px] leading-relaxed">
                      <span className="shrink-0" style={{ color: 'var(--color-muted)' }}>▸</span>
                      <span style={{ color: 'var(--color-dim)' }}>{line}</span>
                    </div>
                  ))}
                </div>
            }
            {brief.top_actors?.length > 0 && (
              <div>
                <p className="text-[9px] tracking-widest mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  MOST ACTIVE ACTORS
                </p>
                {brief.top_actors.slice(0, 4).map((a, i) => (
                  <div key={i} className="flex justify-between text-[10px] mb-1">
                    <span style={{ color: 'var(--color-dim)' }}>{a.name}</span>
                    <span className="tabular-nums" style={{ color: 'var(--color-muted)' }}>{a.count} EVT</span>
                  </div>
                ))}
              </div>
            )}
          </>
        }
      </div>
    </div>
  )
}