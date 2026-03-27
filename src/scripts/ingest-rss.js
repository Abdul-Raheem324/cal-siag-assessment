// ============================================
// RSS INGESTION SCRIPT
// Sources: Reuters, BBC, Al Jazeera, France24,
//          Times of Israel, Middle East Eye
// Run: node scripts/ingest-rss.js
// ============================================
// import Parser from 'rss-parser'
// import { enrichEvent } from '../lib/scoring.js'
// import { insertEvent } from '../lib/db.js'
// import 'dotenv/config'

// const parser = new Parser({
//   timeout: 10000,
//   headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OSINT-Bot/1.0)' }
// })

// // ============================================
// // RSS SOURCES - Best for Middle East conflict
// // ============================================
// const RSS_SOURCES = [
//   // {
//   //   name: 'Reuters',
//   //   url: 'https://feeds.reuters.com/reuters/worldNews',
//   //   type: 'news',
//   //   tier: 1
//   // },
//   {
//     name: 'BBC World',
//     url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml',
//     type: 'news',
//     tier: 1
//   },
//   {
//     name: 'Al Jazeera',
//     url: 'https://www.aljazeera.com/xml/rss/all.xml',
//     type: 'news',
//     tier: 2
//   },
//   {
//     name: 'France24',
//     url: 'https://www.france24.com/en/middle-east/rss',
//     type: 'news',
//     tier: 2
//   },
//   {
//     name: 'Times of Israel',
//     url: 'https://www.timesofisrael.com/feed/',
//     type: 'news',
//     tier: 2
//   },
//   {
//     name: 'Middle East Eye',
//     url: 'https://www.middleeasteye.net/rss',
//     type: 'news',
//     tier: 2
//   },
//   // {
//   //   name: 'Axios World',
//   //   url: 'https://api.axios.com/feed/topics/world',
//   //   type: 'news',
//   //   tier: 2
//   // },
//   {
//     name: 'The Guardian Middle East',
//     url: 'https://www.theguardian.com/world/middleeast/rss',
//     type: 'news',
//     tier: 2
//   }
// ]

// // Keywords to filter relevant articles only
// const CONFLICT_KEYWORDS = [
//   'iran', 'israel', 'idf', 'irgc', 'hezbollah', 'hamas', 'houthi',
//   'gaza', 'tehran', 'tel aviv', 'jerusalem', 'beirut', 'strike',
//   'missile', 'drone', 'nuclear', 'sanctions', 'middle east',
//   'netanyahu', 'khamenei', 'centcom', 'pentagon', 'islamic jihad',
//   'west bank', 'rafah', 'lebanon', 'syria', 'iraq militia'
// ]

// function isRelevant(text) {
//   const lower = (text || '').toLowerCase()
//   return CONFLICT_KEYWORDS.some(kw => lower.includes(kw))
// }

// async function ingestSource(source) {
//   console.log(`\n📡 Fetching: ${source.name}`)
//   let feed

//   try {
//     feed = await parser.parseURL(source.url)
//   } catch (err) {
//     console.error(`  ❌ Failed to fetch ${source.name}: ${err.message}`)
//     return { inserted: 0, skipped: 0 }
//   }

//   let inserted = 0, skipped = 0

//   for (const item of feed.items) {
//     // Combine title + summary for better keyword matching and enrichment
//     const fullText = `${item.title || ''} ${item.contentSnippet || item.summary || ''}`

//     // Filter to relevant conflict events only
//     if (!isRelevant(fullText)) {
//       skipped++
//       continue
//     }

//     const rawEvent = {
//       claim_text: fullText.trim(),
//       source_name: source.name,
//       source_url: item.link || item.guid || '',
//       source_type: source.type,
//       published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
//     }

//     // Enrich with scoring, actor detection, location, etc.
//     const enriched = enrichEvent(rawEvent)

//     // Insert into Supabase (handles dedup + actor relations internally)
//     const result = await insertEvent(enriched)
//     if (result) inserted++
//   }

//   console.log(`  ✅ ${source.name}: ${inserted} inserted, ${skipped} irrelevant skipped`)
//   return { inserted, skipped }
// }

// async function runRSSIngestion() {
//   console.log('🚀 Starting RSS Ingestion...')
//   console.log(`⏰ ${new Date().toISOString()}\n`)

//   let totalInserted = 0

//   for (const source of RSS_SOURCES) {
//     const { inserted } = await ingestSource(source)
//     totalInserted += inserted
//     // Small delay between sources to be respectful
//     await new Promise(r => setTimeout(r, 1000))
//   }

//   console.log(`\n✨ RSS Ingestion complete: ${totalInserted} new events inserted`)
// }

// runRSSIngestion().catch(console.error)


// With GEMINI 
// ============================================
// RSS INGESTION SCRIPT with Gemini Enrichment
// ============================================
// scripts/ingest-rss.js
// import Parser from 'rss-parser'
// import { enrichEventWithGemini } from '../lib/gemini-enrichment.js'
// import 'dotenv/config'
// import { computeValidation, groupEvents } from '../lib/scoring.js'

// const parser = new Parser({
//   timeout: 10000,
//   headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OSINT-Bot/1.0)' }
// })

// // ============================================
// // RSS SOURCES
// // ============================================
// const RSS_SOURCES = [
//   // {
//   //   name: 'Reuters',
//   //   url: 'https://feeds.reuters.com/reuters/worldNews',
//   //   type: 'news',
//   //   tier: 1
//   // },
//   // {
//   //   name: 'BBC World',
//   //   url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml',
//   //   type: 'news',
//   //   tier: 1
//   // },
//   // {
//   //   name: 'Al Jazeera',
//   //   url: 'https://www.aljazeera.com/xml/rss/all.xml',
//   //   type: 'news',
//   //   tier: 2
//   // },
//   // {
//   //   name: 'France24',
//   //   url: 'https://www.france24.com/en/middle-east/rss',
//   //   type: 'news',
//   //   tier: 2
//   // },
//   // {
//   //   name: 'Times of Israel',
//   //   url: 'https://www.timesofisrael.com/feed/',
//   //   type: 'news',
//   //   tier: 2
//   // },
//   // {
//   //   name: 'Middle East Eye',
//   //   url: 'https://www.middleeasteye.net/rss',
//   //   type: 'news',
//   //   tier: 2
//   // },
//   {
//     name: 'The Guardian',
//     url: 'https://www.theguardian.com/world/middleeast/rss',
//     type: 'news',
//     tier: 2
//   }
// ]

// // Keywords to filter relevant articles
// const CONFLICT_KEYWORDS = [
//   'iran', 'israel', 'idf', 'irgc', 'hezbollah', 'hamas', 'houthi',
//   'gaza', 'tehran', 'tel aviv', 'jerusalem', 'beirut', 'strike',
//   'missile', 'drone', 'nuclear', 'sanctions', 'middle east',
//   'netanyahu', 'khamenei', 'centcom', 'pentagon', 'islamic jihad',
//   'west bank', 'rafah', 'lebanon', 'syria', 'iraq militia', 'attack'
// ]

// function isRelevant(text) {
//   const lower = (text || '').toLowerCase()
//   return CONFLICT_KEYWORDS.some(kw => lower.includes(kw))
// }

// // ── CLUSTER RAW EVENTS ──────────────────────
// function clusterRawEvents(rawEvents) {
//   console.log(`\n🔗 Clustering ${rawEvents.length} events...`)
//   const clusters = []
  
//   for (const event of rawEvents) {
//     let foundCluster = null
    
//     for (const cluster of clusters) {
//       const text1 = event.claim_text.toLowerCase()
//       const text2 = cluster[0].claim_text.toLowerCase()
      
//       // Simple similarity: same country/actor mentioned
//       const countries = ['iran', 'israel', 'iraq', 'lebanon', 'yemen', 'syria']
//       const countryMatch = countries.some(c => text1.includes(c) && text2.includes(c))
      
//       if (countryMatch) {
//         foundCluster = cluster
//         break
//       }
//     }
    
//     if (foundCluster) {
//       foundCluster.push(event)
//     } else {
//       clusters.push([event])
//     }
//   }
  
//   console.log(`✅ Clustered into ${clusters.length} groups\n`)
//   return clusters
// }

// // ── MOCK ENRICH (No API) ────────────────────
// function mockEnrichEvent(rawEvent) {
//   const text = (rawEvent.claim_text || '').toLowerCase()

//   const eventTypeMap = {
//     'airstrike': ['airstrike', 'air strike', 'bombing', 'bombed'],
//     'missile_attack': ['missile', 'ballistic', 'rocket'],
//     'drone_attack': ['drone', 'uav'],
//     'diplomatic': ['diplomatic', 'talks', 'negotiations', 'peace'],
//     'sanctions': ['sanction', 'embargo'],
//     'military_movement': ['deploy', 'troops', 'mobilize'],
//     'protest': ['protest', 'rally'],
//     'other': []
//   }

//   let eventType = 'other'
//   for (const [type, keywords] of Object.entries(eventTypeMap)) {
//     if (keywords.some(kw => text.includes(kw))) {
//       eventType = type
//       break
//     }
//   }

//   const countryMap = {
//     'iran': 'Iran', 'israel': 'Israel', 'iraq': 'Iraq',
//     'lebanon': 'Lebanon', 'yemen': 'Yemen', 'syria': 'Syria'
//   }

//   let country = 'Unknown'
//   for (const [keyword, cty] of Object.entries(countryMap)) {
//     if (text.includes(keyword)) {
//       country = cty
//       break
//     }
//   }

//   const actorMap = {
//     'iran': 'Iran', 'israel': 'Israel', 'us': 'United States',
//     'netanyahu': 'Netanyahu', 'khamenei': 'Khamenei',
//     'hezbollah': 'Hezbollah', 'hamas': 'Hamas', 'idf': 'IDF', 'irgc': 'IRGC'
//   }

//   let actor1 = null, actor2 = null
//   const foundActors = []
//   for (const [keyword, actor] of Object.entries(actorMap)) {
//     if (text.includes(keyword) && !foundActors.includes(actor)) {
//       if (!actor1) actor1 = actor
//       else if (!actor2) { actor2 = actor; break }
//       foundActors.push(actor)
//     }
//   }

//   const coords = {
//     'Iran': { lat: 32.4279, lng: 53.688 },
//     'Israel': { lat: 31.0461, lng: 34.8516 },
//     'Iraq': { lat: 33.2232, lng: 43.6793 },
//     'Lebanon': { lat: 33.8547, lng: 35.8623 },
//     'Unknown': { lat: 29.5, lng: 42.5 }
//   }
//   const coord = coords[country] || coords['Unknown']

//   let severity = 3
//   if (text.includes('killed') || text.includes('death')) severity = 9.5
//   else if (text.includes('strike') || text.includes('attack')) severity = 7.5
//   else if (text.includes('deploy')) severity = 5.5

//   return {
//     source_name: rawEvent.source_name,
//     source_url: rawEvent.source_url,
//     source_type: rawEvent.source_type || 'news',
//     source_tier: rawEvent.source_name?.includes('Reuters') || rawEvent.source_name?.includes('BBC') ? 1 : 2,
//     event_datetime_utc: rawEvent.published_at || new Date().toISOString(),
//     claim_text: rawEvent.claim_text,
//     event_type: eventType,
//     domain: eventType === 'airstrike' || eventType === 'missile_attack' ? 'military' : 'political',
//     country,
//     location_text: country,
//     latitude: coord.lat,
//     longitude: coord.lng,
//     actor_1: actor1,
//     actor_2: actor2,
//     actor_action: 'interacted',
//     severity_score: severity,
//     confidence_score: 6.5,
//     confidence_source_tier: 6.5,
//     confidence_recency: 8,
//     confidence_corroboration: 6,
//     contradiction_flag: false,
//     corroboration_count: 1,
//     ai_summary: '[MOCK ENRICHMENT]',
//     ai_extracted: false,
//     is_escalation_signal: false,
//     related_event_id: null,
//     tags: [country, eventType, actor1, actor2].filter(Boolean),
//     verified: false,
//     last_updated_at: new Date().toISOString()
//   }
// }

// // ── INGEST SINGLE SOURCE ──────────────────────
// async function ingestSource(source) {
//   console.log(`📡 Fetching: ${source.name}`)
//   let feed

//   try {
//     feed = await parser.parseURL(source.url)
//   } catch (err) {
//     console.error(`  ❌ Failed: ${err.message}`)
//     return { items: [], skipped: 0 }
//   }

//   const relevantItems = []
//   let skipped = 0

//   for (const item of feed.items) {
//     const fullText = `${item.title || ''} ${item.contentSnippet || item.summary || ''}`

//     if (!isRelevant(fullText)) {
//       skipped++
//       continue
//     }

//     relevantItems.push({
//       claim_text: fullText.trim(),
//       source_name: source.name,
//       source_url: item.link || item.guid || '',
//       source_type: source.type,
//       published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
//     })
//   }

//   console.log(`  ✅ Found ${relevantItems.length} relevant articles`)
//   return { items: relevantItems, skipped }
// }

// // ── MASTER PIPELINE ─────────────────────────
// async function runRSSIngestion() {
//   console.log('🚀 Starting RSS Ingestion Pipeline...')
//   console.log(`⏰ ${new Date().toISOString()}\n`)

//   let allRawEvents = []

//   // ========== PHASE 1: FETCH & FILTER ==========
//   console.log('PHASE 1: FETCHING & FILTERING')
//   console.log('─'.repeat(60) + '\n')

//   for (const source of RSS_SOURCES) {
//     const { items } = await ingestSource(source)
//     allRawEvents = allRawEvents.concat(items)
//     await new Promise(r => setTimeout(r, 1000))
//   }

//   console.log(`\n📊 Total fetched: ${allRawEvents.length}\n`)

//   if (allRawEvents.length === 0) {
//     console.error('❌ No events found')
//     return
//   }

//   // ========== PHASE 2: CLUSTER EVENTS ==========
//   console.log('PHASE 2: CLUSTERING')
//   console.log('─'.repeat(60))

//   const clusters = clusterRawEvents(allRawEvents)

//   // ========== PHASE 3: ENRICH TOP 3 WITH GEMINI ==========
//   console.log('PHASE 3: ENRICHMENT (Gemini on top 3 clusters only)')
//   console.log('─'.repeat(60) + '\n')

//   const enriched = []
//   let geminiCalls = 0

//   // Enrich top 3 clusters with Gemini
//   for (let i = 0; i < Math.min(3, clusters.length); i++) {
//     const cluster = clusters[i]
//     const representative = cluster[0]

//     process.stdout.write(`\r  [${i + 1}/3] 🔴 GEMINI CALL on cluster with ${cluster.length} events...`)

//     try {
//       const enrichedEvent = await enrichEventWithGemini(representative)
//       if (enrichedEvent) {
//         geminiCalls++
//         // Apply to all events in cluster
//         cluster.forEach(event => {
//           enriched.push({
//             ...enrichedEvent,
//             source_name: event.source_name,
//             source_url: event.source_url,
//             claim_text: event.claim_text,
//             published_at: event.published_at,
//             enrichment_method: 'gemini'
//           })
//         })
//       }
//     } catch (err) {
//       console.error(`\n  ❌ Gemini error: ${err.message}`)
//       // Fall back to mock
//       cluster.forEach(event => {
//         enriched.push({ ...mockEnrichEvent(event), enrichment_method: 'mock_fallback' })
//       })
//     }

//     await new Promise(r => setTimeout(r, 4000))
//   }

//   console.log('\n')

//   // Mock enrich remaining clusters
//   console.log(`  🟢 MOCK enriching remaining ${clusters.length - Math.min(3, clusters.length)} clusters...`)
//   for (let i = 3; i < clusters.length; i++) {
//     const cluster = clusters[i]
//     cluster.forEach(event => {
//       enriched.push({ ...mockEnrichEvent(event), enrichment_method: 'mock' })
//     })
//   }

//   console.log(`\n✅ Enriched ${enriched.length} events (${geminiCalls} Gemini calls)\n`)

//   // ========== PHASE 4: GROUP & VALIDATE ==========
//   console.log('PHASE 4: GROUPING & VALIDATION')
//   console.log('─'.repeat(60) + '\n')

//   const groups = groupEvents(enriched)
//   const validatedEvents = []
//   let verifiedCount = 0

//   groups.forEach((group, idx) => {
//     const validation = computeValidation(group)
//     const verified = validation.verified ? '✅' : '❌'

//     console.log(`${verified} GROUP #${idx + 1}: ${group.length} events from ${[...new Set(group.map(e => e.source_name))].length} sources`)
//     console.log(`   ${validation.explanation}\n`)

//     group.forEach(event => {
//       validatedEvents.push({
//         ...event,
//         verified: validation.verified,
//         corroboration_count: validation.corroborationCount
//       })
//       if (validation.verified) verifiedCount++
//     })
//   })

//   // ========== SUMMARY ==========
//   console.log(`\n${'='.repeat(60)}`)
//   console.log(`✨ INGESTION COMPLETE`)
//   console.log(`${'='.repeat(60)}`)
//   console.log(`📊 Fetched: ${allRawEvents.length}`)
//   console.log(`🔗 Clusters: ${clusters.length}`)
//   console.log(`🤖 Enriched: ${enriched.length}`)
//   console.log(`   • Gemini calls: ${geminiCalls}`)
//   console.log(`   • Mock fallback: ${enriched.length - enriched.filter(e => e.enrichment_method === 'gemini').length}`)
//   console.log(`✅ Verified events: ${verifiedCount}/${validatedEvents.length}`)
//   console.log(`${'='.repeat(60)}\n`)

//   // ========== LOG SAMPLE DATA ==========
//   console.log('📋 SAMPLE VALIDATED EVENTS:\n')
//   validatedEvents.slice(0, 3).forEach((event, idx) => {
//     console.log(`[${idx + 1}] ${event.verified ? '✅' : '❌'} ${event.source_name}`)
//     console.log(`    Type: ${event.event_type} | Country: ${event.country}`)
//     console.log(`    Claim: "${event.claim_text.substring(0, 70)}..."`)
//     console.log(`    Method: ${event.enrichment_method}\n`)
//   })

//   // ========== JSON OUTPUT ==========
//   console.log('\n📁 FULL JSON OUTPUT:\n')
//   console.log(JSON.stringify({ 
//     summary: { total: validatedEvents.length, verified: verifiedCount },
//     events: validatedEvents 
//   }, null, 2))
// }

// runRSSIngestion().catch(console.error)
import dotenv from 'dotenv';
import Parser from 'rss-parser';

dotenv.config({ path: '../.env.local' });

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OSINT-Bot/1.0)' }
})

const RSS_SOURCES = [
  {
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml',
    type: 'news',
    tier: 1
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    type: 'news',
    tier: 2
  },
  {
    name: 'France24',
    url: 'https://www.france24.com/en/middle-east/rss',
    type: 'news',
    tier: 2
  },
  {
    name: 'Times of Israel',
    url: 'https://www.timesofisrael.com/feed/',
    type: 'news',
    tier: 2
  },
  {
    name: 'Middle East Eye',
    url: 'https://www.middleeasteye.net/rss',
    type: 'news',
    tier: 2
  },
  {
    name: 'The Guardian Middle East',
    url: 'https://www.theguardian.com/world/middleeast/rss',
    type: 'news',
    tier: 2
  }
]

const CONFLICT_KEYWORDS = [
  'iran', 'israel', 'idf', 'irgc', 'hezbollah', 'hamas', 'houthi',
  'gaza', 'tehran', 'tel aviv', 'jerusalem', 'beirut', 'strike',
  'missile', 'drone', 'nuclear', 'sanctions', 'middle east',
  'netanyahu', 'khamenei', 'centcom', 'pentagon', 'islamic jihad',
  'west bank', 'rafah', 'lebanon', 'syria', 'iraq militia'
]

function isRelevant(text) {
  const lower = (text || '').toLowerCase()
  return CONFLICT_KEYWORDS.some(kw => lower.includes(kw))
}

async function ingestSource(source) {
    const { enrichEvent, shouldRejectArticle } = await import('../lib/scoring.js');
    const { insertEvent } = await import('../lib/db.js');
  console.log(`\n📡 Fetching: ${source.name}`)
  let feed

  try {
    feed = await parser.parseURL(source.url)
  } catch (err) {
    console.error(`  ❌ Failed to fetch ${source.name}: ${err.message}`)
    return { inserted: 0, skipped: 0, rejected: 0 }
  }

  let inserted = 0, skipped = 0, rejected = 0

  for (const item of feed.items) {
    const title = item.title || ''
    const snippet = item.contentSnippet || item.summary || ''
    const fullText = `${title} ${snippet}`

    // GATE 1: reject opinion, podcast, explainer, closed liveblogs, etc.
    if (shouldRejectArticle(title, snippet)) {
      rejected++
      console.log(`  🚫 Rejected: ${title.slice(0, 70)}`)
      continue
    }

    // GATE 2: must mention conflict keywords
    if (!isRelevant(fullText)) {
      skipped++
      continue
    }

    const rawEvent = {
      claim_text: fullText.trim(),
      source_name: source.name,
      source_url: item.link || item.guid || '',
      source_type: source.type,
      published_at: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString()
    }

    const enriched = enrichEvent(rawEvent)
    const result = await insertEvent(enriched)
    if (result) inserted++
  }

  console.log(`  ✅ ${source.name}: ${inserted} inserted, ${rejected} rejected, ${skipped} irrelevant skipped`)
  return { inserted, skipped, rejected }
}

async function runRSSIngestion() {
    const Parser = (await import('rss-parser')).default;
  const { enrichEvent, shouldRejectArticle } = await import('../lib/scoring.js');
  const { insertEvent } = await import('../lib/db.js');

  const parser = new Parser({
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OSINT-Bot/1.0)' }
  });
  console.log('🚀 Starting RSS Ingestion...')
  console.log(`⏰ ${new Date().toISOString()}\n`)

  let totalInserted = 0, totalRejected = 0

  for (const source of RSS_SOURCES) {
    const { inserted, rejected } = await ingestSource(source)
    totalInserted += inserted
    totalRejected += rejected
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n✨ RSS Ingestion complete: ${totalInserted} inserted, ${totalRejected} rejected`)
}

runRSSIngestion().catch(console.error)  