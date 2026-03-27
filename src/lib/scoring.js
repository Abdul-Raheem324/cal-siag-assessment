// ============================================
// SCORING ENGINE v3 — FIXED
// Fixes:
//   1. Actor detection: subject-first heuristic
//   2. Country detection: sentence-level (not full block)
//   3. Escalation: broader keyword set
//   4. Event type: "rocket", "killed", "wounds" patterns
// ============================================
export function shouldRejectArticle(title, description = '') {
  const text = `${title} ${description}`.toLowerCase()

  const REJECT_PATTERNS = [
    // Format signals — these are never operational intelligence
    'podcast', '– podcast', '- podcast',
    'opinion:', 'opinion |', '| opinion',
    'editorial:', 'letters:', '| letters',
    'in pictures', 'photo essay', 'explainer:',
    'what to know', 'what we know',
    'week in review', 'morning briefing',
    'newsletter', 'subscribe',
    'guardian weekly', 'inside the.*weekly',
    'as it happened',      // closed liveblogs — stale aggregations
    'this blog is closed', // same

    // Clearly off-topic for conflict monitoring
    'shipwreck', 'archaeological', 'history of war',
    'wind farm', 'offshore wind', 'windfarm',
    'gold prices', 'bitcoin', 'stock market',
    'recipe', 'sport', 'football', 'cricket',
    '2,600-year', '3,000-year',
  ]

  return REJECT_PATTERNS.some(p => {
    if (p.includes('.*')) return new RegExp(p).test(text)
    return text.includes(p)
  })
}
// ── SOURCE TIERS ────────────────────────────
export const SOURCE_TIERS = {
  'reuters':          1,
  'associated press': 1,
  'afp':              1,
  'bbc':              1,
  'ap news':          1,

  'guardian':         2,
  'al jazeera':       2,
  'aljazeera':        2,
  'france24':         2,
  'times of israel':  2,
  'haaretz':          2,
  'axios':            2,
  'middle east eye':  2,
  'trt world':        2,
  'reliefweb':        2,
  'wikipedia':        2,
  'acled':            2,
  'jerusalem post':   2,
  'jpost':            2,
  'telegraph':        2,

  'telegram':         3,
  'twitter':          3,
  'gdelt':            3,
  'unknown':          3,
}

export const TIER_SCORES = { 1: 9.0, 2: 6.5, 3: 3.0 }
export const TIER_LABELS = {
  1: 'Tier 1 — Major wire service (Reuters/BBC/AP)',
  2: 'Tier 2 — Credible regional outlet',
  3: 'Tier 3 — Unverified / social / aggregated',
}

// ── ACTOR LIST ──────────────────────────────
// ORDER IS CRITICAL — most specific first.
export const KNOWN_ACTORS = [
  'US CENTCOM', 'CENTCOM',
  'IRGC',
  'IDF',
  'Islamic Jihad',
  'Hezbollah',
  'Hamas',
  'Houthis',
  'Mossad',
  'CIA',
  'Pentagon',
  'White House',
  'Knesset',
  'Netanyahu', 'Khamenei', 'Biden', 'Trump',
  'Ghalibaf', 'Sinwar', 'Nasrallah', 'Gallant',
  'Vance', 'Witkoff', 'Kushner', 'Starmer',
  'United States',
  'Israel',
  'Iran',
  'Lebanon',
  'Palestine',
  'Yemen',
  'Syria',
  'Iraq',
  'Jordan',
  'Saudi Arabia',
  'Pakistan',
  'Australia',
  'UK',
  // Short/ambiguous LAST
  'UN',
  'US',
]

// ── COUNTRY DETECTION ────────────────────────
// FIX: Use a priority map so more specific terms beat generic ones.
// Also: we run detection only on the FIRST sentence of claim_text,
// not the entire block (prevents section-header bleed).
const COUNTRY_PRIORITY = [
  // Most specific — city/location names (checked first)
  { key: 'bnei brak',       country: 'Israel' },
  { key: 'tel aviv',        country: 'Israel' },
  { key: 'jerusalem',       country: 'Israel' },
  { key: 'haifa',           country: 'Israel' },
  { key: 'negev',           country: 'Israel' },
  { key: 'litani',          country: 'Lebanon' },
  { key: 'beirut',          country: 'Lebanon' },
  { key: 'tehran',          country: 'Iran' },
  { key: 'isfahan',         country: 'Iran' },
  { key: 'kharg island',    country: 'Iran' },
  { key: 'strait of hormuz',country: 'Iran' },
  { key: 'kuwait international airport', country: 'Kuwait' },
  { key: 'baghdad',         country: 'Iraq' },
  { key: 'al anbar',        country: 'Iraq' },
  { key: 'anbar',           country: 'Iraq' },
  { key: 'damascus',        country: 'Syria' },
  { key: 'sanaa',           country: 'Yemen' },
  { key: 'ramallah',        country: 'Palestine' },
  { key: 'west bank',       country: 'Palestine' },
  { key: 'gaza',            country: 'Palestine' },
  { key: 'rafah',           country: 'Palestine' },
  { key: 'washington',      country: 'United States' },
  { key: 'amman',           country: 'Jordan' },
  { key: 'riyadh',          country: 'Saudi Arabia' },
  { key: 'islamabad',       country: 'Pakistan' },
  { key: 'auvere',          country: 'Estonia' },
  { key: 'belgorod',        country: 'Russia' },
  { key: 'estonia',         country: 'Estonia' },
  { key: 'latvia',          country: 'Latvia' },
  // Country names (checked after city names)
  { key: 'kuwait',          country: 'Kuwait' },
  { key: 'lebanon',         country: 'Lebanon' },
  { key: 'jordan',          country: 'Jordan' },
  { key: 'iraq',            country: 'Iraq' },
  { key: 'israel',          country: 'Israel' },
  { key: 'iran',            country: 'Iran' },
  { key: 'syria',           country: 'Syria' },
  { key: 'yemen',           country: 'Yemen' },
  { key: 'palestine',       country: 'Palestine' },
  { key: 'pakistan',        country: 'Pakistan' },
  { key: 'saudi arabia',    country: 'Saudi Arabia' },
  { key: 'united states',   country: 'United States' },
  { key: 'pentagon',        country: 'United States' },
  { key: 'centcom',         country: 'United States' },
  { key: 'bahrain',         country: 'Bahrain' },
  { key: 'irgc',            country: 'Iran' },
]

// ── COORDINATES ─────────────────────────────
const LOCATION_COORDS = {
  'Israel':        { lat: 31.0461,  lng: 34.8516 },
  'Iran':          { lat: 32.4279,  lng: 53.6880 },
  'Lebanon':       { lat: 33.8547,  lng: 35.8623 },
  'Palestine':     { lat: 31.9522,  lng: 35.2332 },
  'Gaza':          { lat: 31.3547,  lng: 34.3088 },
  'Yemen':         { lat: 15.5527,  lng: 48.5164 },
  'Syria':         { lat: 34.8021,  lng: 38.9968 },
  'Iraq':          { lat: 33.2232,  lng: 43.6793 },
  'United States': { lat: 38.8951,  lng: -77.036 },
  'Jordan':        { lat: 30.5852,  lng: 36.2384 },
  'Saudi Arabia':  { lat: 23.8859,  lng: 45.0792 },
  'Kuwait':        { lat: 29.3759,  lng: 47.9774 },
  'Bahrain':       { lat: 26.0667,  lng: 50.5577 },
  'Pakistan':      { lat: 30.3753,  lng: 69.3451 },
  'Estonia':       { lat: 58.5953,  lng: 25.0136 },
  'Latvia':        { lat: 56.8796,  lng: 24.6032 },
  'Russia':        { lat: 61.5240,  lng: 105.318 },
}

// ── EVENT TYPE PATTERNS ──────────────────────
const EVENT_TYPE_PATTERNS = {
  'airstrike':          ['airstrike', 'air strike', 'warplane', 'f-35', 'f35', 'warplanes struck', 'air raid', 'bombing run', 'american airstrike', 'israeli airstrike'],
  'missile_attack':     ['missile', 'ballistic', 'rocket barrage', 'iron dome', 'intercept', 'rocket fire', 'rocket attack'],
  'drone_attack':       ['drone', 'uav', 'unmanned', 'shaheed', 'shahed'],
  'military_movement':  ['deploy', 'troops', 'mobilize', 'naval', 'carrier', 'airborne', 'boots on the ground', 'buffer zone', 'seize parts', 'defensive buffer', 'security zone', 'marines'],
  'diplomatic':         ['diplomatic', 'ambassador', 'embassy', 'summit', 'negotiations', 'broker', 'ceasefire', 'peace talks', 'peace deal', 'proposal to end', 'host.*talks', '15-point plan', 'comprehensive deal'],
  'sanctions':          ['sanction', 'embargo', 'restriction', 'freeze assets', 'easing of.*sanctions'],
  'statement':          ['declared', 'announced', 'vowed', 'pledged', 'states that', 'says that', 'reports that'],
  'cyber':              ['cyber', 'hack', 'malware', 'ddos'],
  'humanitarian':       ['humanitarian aid', 'refugee', 'evacuation', 'death toll', 'civilian casualties', 'wounded', 'killed.*civilians'],
  'protest':            ['protest', 'rally', 'demonstration'],
}

// ── SEVERITY TIERS ───────────────────────────
const SEVERITY_TIERS = [
  {
    score: 9.5,
    required: ['killed', 'dead', 'fatalities', 'death toll', 'casualties', 'wounds', 'injures', 'injured', 'kill'],
    boost:    ['dozens', 'hundreds', 'mass', 'civilian', 'children', 'baby', 'commander'],
  },
  {
    score: 8.0,
    required: ['airstrike', 'air strike', 'missile strike', 'drone strike',
               'explosion', 'warplanes struck', 'struck', 'bombed', 'shelled',
               'rocket fire', 'cluster bomb', 'ballistic missile'],
    boost:    ['nuclear', 'ballistic', 'tehran', 'tel aviv', 'airport'],
  },
  {
    score: 6.5,
    required: ['nuclear', 'attack', 'combat', 'seize', 'troops deployed',
               'boots on the ground', 'fire at', 'intercepts', 'invade', 'capture'],
    boost:    ['irgc', 'idf', 'centcom'],
  },
  {
    score: 5.0,
    required: ['threat', 'warn', 'sanction', 'mobilize', 'deploy', 'intercept',
               'escalat', 'tension', 'security zone', 'marines', 'ceasefire'],
    boost:    [],
  },
  {
    score: 3.0,
    required: ['negotiations', 'peace talks', 'proposal', 'diplomatic', 'host.*talks',
               'ready to host', 'comprehensive deal', 'plan to end'],
    boost:    [],
  },
  {
    score: 2.0,
    required: ['obituary', 'cartoon', 'podcast', 'opinion', 'editorial',
               'view on', 'in pictures', 'explainer', 'what to know', 'gold prices', 'bookings'],
    boost:    [],
  },
]

// ── DOMAIN MAP ───────────────────────────────
const DOMAIN_MAP = {
  'airstrike': 'military', 'missile_attack': 'military',
  'drone_attack': 'military', 'military_movement': 'military',
  'diplomatic': 'political', 'sanctions': 'economic',
  'statement': 'political', 'cyber': 'cyber',
  'humanitarian': 'humanitarian', 'protest': 'political', 'other': 'political',
}

// ── ACTION PATTERNS ──────────────────────────
const ACTION_PATTERNS = {
  'attacked':   ['attacked', 'struck', 'bombed', 'fired at', 'launched strike', 'hit', 'kills', 'wounded', 'injured'],
  'condemned':  ['condemned', 'denounced', 'criticized', 'rejected'],
  'threatened': ['threatened', 'warned', 'vowed', 'pledged retaliation', 'planning to invade'],
  'responded':  ['responded', 'retaliated', 'in response', 'intercepts', 'intercepted'],
  'sanctioned': ['sanctioned', 'imposed sanctions'],
  'supported':  ['supported', 'backed', 'aided'],
  'deployed':   ['deployed', 'mobilized', 'sent troops', 'seize', 'security zone'],
  'negotiated': ['negotiat', 'peace talks', 'broker', 'host.*talks', 'ready to host'],
}

const ESCALATION_WORDS = [
  'retaliat', 'escalat', 'in retaliation', 'following the attack',
  'after the strike', 'second wave', 'renewed', 'intensif',
  'new wave of attacks', 'widen', 'expand the conflict',
  // FIX: added common escalation signals from real events
  'intercepts.*launched from', 'in response to', 'follows an.*strike',
  'cluster bomb', 'ballistic missile.*wounds', 'rocket fire kills',
  'planning to invade', 'capture its', 'marines.*arrive',
  'death toll.*risen', 'killed.*commander',
]

// ── EXPORTED FUNCTIONS ────────────────────────

export function getSourceTier(sourceName) {
  const lower = (sourceName || '').toLowerCase()
  for (const [key, tier] of Object.entries(SOURCE_TIERS)) {
    if (lower.includes(key)) return tier
  }
  return 3
}

export function detectEventType(text) {
  const lower = text.toLowerCase()
  for (const [type, patterns] of Object.entries(EVENT_TYPE_PATTERNS)) {
    if (patterns.some(p => {
      // Support simple regex patterns (those containing .*)
      if (p.includes('.*')) {
        return new RegExp(p).test(lower)
      }
      return lower.includes(p)
    })) return type
  }
  return 'other'
}

export function detectActors(text) {
  // FIX: Use only the FIRST sentence to detect actors.
  // Wikipedia sections have section headers that pollute actor detection.
  // The first sentence is the most reliable signal for who is doing what.
  const firstSentence = text.split(/\n/)[0]?.split(/[.!?]/)[0] || text

  const found = []
  for (const actor of KNOWN_ACTORS) {
    const regex = new RegExp(`\\b${actor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (regex.test(firstSentence) && !found.includes(actor)) {
      found.push(actor)
      if (found.length === 2) break
    }
  }

  // If first sentence didn't yield 2 actors, fall back to full text
  if (found.length < 2) {
    for (const actor of KNOWN_ACTORS) {
      if (found.includes(actor)) continue
      const regex = new RegExp(`\\b${actor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(text)) {
        found.push(actor)
        if (found.length === 2) break
      }
    }
  }

  return { actor_1: found[0] || null, actor_2: found[1] || null }
}

export function detectCountry(text) {
  // FIX: Run detection on the LAST non-empty line of the text block,
  // then the first sentence, then full text.
  // Wikipedia puts the real event in the last bullet, section headers first.
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const lastLine = lines[lines.length - 1] || text
  const firstLine = lines[0] || text

  // Try last line first (most specific for Wikipedia bullet blocks)
  const fromLast = _detectCountryFromString(lastLine)
  if (fromLast !== 'Unknown') return fromLast

  // Try first sentence
  const fromFirst = _detectCountryFromString(firstLine)
  if (fromFirst !== 'Unknown') return fromFirst

  // Full text fallback
  return _detectCountryFromString(text)
}

function _detectCountryFromString(str) {
  const lower = str.toLowerCase()
  for (const { key, country } of COUNTRY_PRIORITY) {
    if (lower.includes(key)) return country
  }
  return 'Unknown'
}

export function getCoordinates(country) {
  return LOCATION_COORDS[country] || { lat: 29.5, lng: 42.5 }
}

export function detectDomain(eventType) {
  return DOMAIN_MAP[eventType] || 'political'
}

export function computeSeverityScore(text, eventType) {
  const lower = text.toLowerCase()
  for (const tier of SEVERITY_TIERS) {
    const matches = tier.required.some(w => {
      if (w.includes('.*')) return new RegExp(w).test(lower)
      return lower.includes(w)
    })
    if (matches) {
      const boostCount = tier.boost.filter(w => lower.includes(w)).length
      return Math.round(Math.min(10, tier.score + Math.min(boostCount * 0.3, 1.0)) * 10) / 10
    }
  }
  const typeDefaults = {
    'airstrike': 7.5, 'missile_attack': 8.0, 'drone_attack': 7.0,
    'military_movement': 5.0, 'diplomatic': 3.0, 'sanctions': 4.0,
    'statement': 2.5, 'cyber': 6.0, 'humanitarian': 3.5, 'other': 2.5,
  }
  return typeDefaults[eventType] ?? 3.0
}

export function computeConfidenceScore(sourceName, corroborationCount = 1, publishedHoursAgo = 0) {
  const tier = getSourceTier(sourceName)
  const tierScore = TIER_SCORES[tier]
  const recencyScore = Math.max(1, 10 - (publishedHoursAgo / 24) * 3)
  const corrobScore = Math.min(9, 4 + (corroborationCount * 2))
  const confidence = (tierScore * 0.5) + (recencyScore * 0.3) + (corrobScore * 0.2)
  const ageLabel = publishedHoursAgo < 2 ? 'Breaking' : publishedHoursAgo < 24 ? 'Recent' : `${Math.round(publishedHoursAgo / 24)}d old`

  return {
    confidence_score:         Math.round(Math.min(10, confidence) * 10) / 10,
    confidence_source_tier:   tierScore,
    confidence_recency:       Math.round(recencyScore * 10) / 10,
    confidence_corroboration: corrobScore,
    source_tier:              tier,
    explanation: `${TIER_LABELS[tier]} · ${ageLabel} · ${corroborationCount} source${corroborationCount > 1 ? 's' : ''}`,
  }
}

export function detectActorAction(text) {
  const lower = text.toLowerCase()
  for (const [action, patterns] of Object.entries(ACTION_PATTERNS)) {
    if (patterns.some(p => {
      if (p.includes('.*')) return new RegExp(p).test(lower)
      return lower.includes(p)
    })) return action
  }
  return 'interacted'
}

export function detectEscalationSignal(text, severityScore) {
  // FIX: Lower threshold to 5 (was 6), and use regex for multi-word patterns
  if (severityScore < 5) return false
  const lower = text.toLowerCase()
  return ESCALATION_WORDS.some(w => {
    if (w.includes('.*')) return new RegExp(w).test(lower)
    return lower.includes(w)
  })
}

// ── MASTER ENRICHMENT ────────────────────────
export function enrichEvent(rawEvent) {
  const { claim_text, source_name, source_url, source_type = 'news', published_at } = rawEvent
  const hoursAgo = published_at ? (Date.now() - new Date(published_at).getTime()) / 3_600_000 : 0

  const country       = detectCountry(claim_text)
  const coords        = getCoordinates(country)
  const eventType     = detectEventType(claim_text)
  const domain        = detectDomain(eventType)
  const { actor_1, actor_2 } = detectActors(claim_text)
  const severityScore = computeSeverityScore(claim_text, eventType)
  const confidenceData = computeConfidenceScore(source_name, 1, hoursAgo)
  const isEscalation  = detectEscalationSignal(claim_text, severityScore)
  const actorAction   = detectActorAction(claim_text)

  return {
    claim_text, source_name, source_url, source_type,
    source_tier: confidenceData.source_tier,
    event_datetime_utc: published_at || new Date().toISOString(),
    country, location_text: country,
    latitude: coords.lat, longitude: coords.lng,
    actor_1, actor_2, actor_action: actorAction,
    event_type: eventType, domain,
    severity_score:           severityScore,
    confidence_score:         confidenceData.confidence_score,
    confidence_source_tier:   confidenceData.confidence_source_tier,
    confidence_recency:       confidenceData.confidence_recency,
    confidence_corroboration: confidenceData.confidence_corroboration,
    contradiction_flag:  false,
    corroboration_count: 1,
    is_escalation_signal: isEscalation,
    verified: confidenceData.source_tier === 1,
    ai_summary: null, ai_extracted: false,
    tags: [country, eventType, domain, actor_1, actor_2].filter(Boolean),
    last_updated_at: new Date().toISOString(),
  }
}