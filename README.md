# OSINT Conflict Monitor

A lightweight intelligence dashboard for tracking conflict events related to the Iran–US/Israel situation. Built as part of the SAIG Build Test (25–29 March 2025).

---

## What it does

- **Ingests** conflict-related news from 6 RSS sources
- **Enriches** each article with structured metadata: actors, country, event type, severity score, confidence score
- **Stores** events in Supabase (PostgreSQL) with deduplication and corroboration logic
- **Displays** a dark-mode analyst dashboard with 6 views: Executive Summary, Overview, Event Feed, Map, Actors, Sources

---

## Live Demo

> https://cal-siag-assessment.vercel.app/

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS |
| Charts | Recharts |
| Map | Leaflet |
| Actor graph | D3 force simulation |
| Database | Supabase (PostgreSQL) |
| Ingestion | Node.js, rss-parser |
| Deploy | Vercel |

---

## Project Structure

```
/
├── app/
│   ├── page.tsx                  # Dashboard shell, view routing
│   ├── hooks/useData.ts          # Data-fetching hooks (events, actors, stats, relations)
│   ├── components/
│   │   ├── SummaryView.tsx       # Executive Summary view
│   │   ├── OverviewView.tsx      # Trend charts view
│   │   ├── EventsView.tsx        # Event Feed with filters
│   │   ├── Mapview.tsx           # Leaflet map with geo-clusters
│   │   ├── ActorsView.tsx        # D3 actor relationship graph
│   │   ├── SourcesView.tsx       # Source reliability breakdown
│   │   ├── Sidebar.tsx           # Desktop sidebar nav
│   │   ├── MobileTopBar.tsx      # Mobile header
│   │   └── Mobiletabbar.tsx      # Mobile bottom tab nav
│   └── api/
│       ├── events/route.ts       # GET /api/events (paginated, filterable)
│       ├── actors/route.ts       # GET /api/actors
│       ├── relations/route.ts    # GET /api/relations
│       └── stats/route.ts        # GET /api/stats (timeline, threat level, domain counts)
├── lib/
│   ├── scoring.js                # Enrichment engine (actor, country, severity, confidence)
│   ├── db.js                     # Supabase insert, deduplication, corroboration, actor upsert
│   └── supabaseClient.js         # Supabase client init
├── scripts/
│   └── ingest-rss.js             # RSS ingestion runner
└── .env.local                    # Environment variables (not committed)
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Supabase project (free tier is fine)

### 2. Clone the repo

```bash
git clone https://github.com/your-username/osint-conflict-monitor.git
cd osint-conflict-monitor
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set up the database

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Events table
create table events (
  id uuid primary key default gen_random_uuid(),
  claim_text text,
  source_name text,
  source_url text unique,
  source_type text,
  source_tier int,
  event_datetime_utc timestamptz,
  country text,
  location_text text,
  latitude float,
  longitude float,
  actor_1 text,
  actor_2 text,
  actor_action text,
  event_type text,
  domain text,
  severity_score float,
  confidence_score float,
  confidence_source_tier float,
  confidence_recency float,
  confidence_corroboration float,
  contradiction_flag boolean default false,
  corroboration_count int default 1,
  is_escalation_signal boolean default false,
  verified boolean default false,
  ai_summary text,
  ai_extracted boolean default false,
  tags text[],
  last_updated_at timestamptz default now()
);

-- Actors table
create table actors (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  full_name text,
  country text,
  actor_type text,
  threat_level text,
  event_count int default 0
);

-- Actor relations table
create table actor_relations (
  id uuid primary key default gen_random_uuid(),
  actor_1 text,
  actor_2 text,
  interaction_type text,
  interaction_count int default 1,
  domain text,
  latest_event_id uuid,
  last_interaction_at timestamptz default now()
);
```

### 5. Run the ingestion script

```bash
node scripts/ingest-rss.js
```

This fetches from all 6 RSS sources, enriches each article, and inserts new events into Supabase. Run this on demand or set up a cron job.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Data Pipeline

```
RSS Feeds (6 sources)
       │
       ▼
  Gate 1: Reject gate
  (remove opinions, podcasts, explainers, closed liveblogs)
       │
       ▼
  Gate 2: Relevance gate
  (must contain a conflict keyword)
       │
       ▼
  Enrichment (lib/scoring.js)
  - Detect event type
  - Detect actors (first-sentence heuristic)
  - Detect country (city-first priority map)
  - Compute severity score (tiered keyword matching)
  - Compute confidence score (source tier + recency + corroboration)
  - Detect escalation signal
       │
       ▼
  Deduplication (lib/db.js)
  - URL exact match → skip if duplicate
  - Text snippet similarity → increment corroboration_count if near-match
  - Else → insert as new event
       │
       ▼
  Supabase (events, actors, actor_relations)
```

---

## Scoring Logic

### Severity Score (0–10)

| Score | Condition |
|---|---|
| ~9.5 | Casualties, deaths, injuries reported |
| ~8.0 | Physical strike: airstrike, missile, drone, explosion |
| ~6.5 | Combat terms: attack, seize, nuclear, invade |
| ~5.0 | Threats, deployments, sanctions, ceasefire |
| ~3.0 | Diplomatic talks, proposals |
| ~2.5 | Statements, announcements |

Scores are boosted by up to 1.0 for amplifying context (e.g. "hundreds", "commander", "Tehran", "ballistic").

### Confidence Score (0–10)

```
confidence = (source_tier_score × 0.5) + (recency_score × 0.3) + (corroboration_score × 0.2)
```

| Source Tier | Base Score |
|---|---|
| Tier 1 (BBC, Reuters, AP) | 9.0 |
| Tier 2 (Al Jazeera, Guardian, France24) | 6.5 |
| Tier 3 (Telegram, social, unknown) | 3.0 |

### Threat Level

Computed from the average severity of the last 3 days and total escalation count:

| Level | Condition |
|---|---|
| CRITICAL | Avg severity ≥ 8 OR escalations > 10 |
| HIGH | Avg severity ≥ 6 OR escalations > 5 |
| ELEVATED | Avg severity ≥ 4 |
| LOW | Below elevated threshold |

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/events` | GET | Paginated event list. Params: `domain`, `min_severity`, `escalation`, `search`, `limit`, `offset` |
| `/api/actors` | GET | All actors ordered by event count |
| `/api/relations` | GET | All actor relations ordered by interaction count |
| `/api/stats` | GET | Aggregated stats: total events, escalation count, avg severity, domain counts, daily timeline, threat level |

---

## Known Limitations

- **Actor detection is rule-based**, not NLP. Actors not in the predefined list will be missed.
- **Coordinates are country-level centroids**, not precise event locations.
- **Ingestion is manual/cron-triggered**, not real-time. Typical lag is 15–60 minutes.
- **No authentication**. The dashboard is fully public.

---

## Data Sources

| Source | Tier | Coverage |
|---|---|---|
| BBC World (Middle East) | 1 | Regional news, wire quality |
| Al Jazeera | 2 | Middle East focus |
| France24 | 2 | International, French perspective |
| Times of Israel | 2 | Israel-focused, high frequency |
| Middle East Eye | 2 | Regional analysis and breaking news |
| The Guardian (Middle East) | 2 | Long-form + breaking |

All sources are public RSS feeds. No authentication or scraping is used.

---

## AI Usage Declaration

AI tools were used in this project in the following ways:

- **Code assistance**: GitHub Copilot / Claude used for boilerplate generation, debugging specific issues (Leaflet blank map, D3 tooltip positioning), and reviewing logic.
- **No AI-generated event data**: All event data is sourced from public RSS feeds. No events were fabricated or hallucinated.

---

## Author

Abdul Raheem (Full Stack Developer)
