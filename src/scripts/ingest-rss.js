import dotenv from "dotenv";
import Parser from "rss-parser";

dotenv.config({ path: "../.env.local" });

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; OSINT-Bot/1.0)" },
});

const RSS_SOURCES = [
  {
    name: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    type: "news",
    tier: 1,
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    type: "news",
    tier: 2,
  },
  {
    name: "France24",
    url: "https://www.france24.com/en/middle-east/rss",
    type: "news",
    tier: 2,
  },
  {
    name: "Times of Israel",
    url: "https://www.timesofisrael.com/feed/",
    type: "news",
    tier: 2,
  },
  {
    name: "Middle East Eye",
    url: "https://www.middleeasteye.net/rss",
    type: "news",
    tier: 2,
  },
  {
    name: "The Guardian Middle East",
    url: "https://www.theguardian.com/world/middleeast/rss",
    type: "news",
    tier: 2,
  },
];

const CONFLICT_KEYWORDS = [
  "iran",
  "israel",
  "idf",
  "irgc",
  "hezbollah",
  "hamas",
  "houthi",
  "gaza",
  "tehran",
  "tel aviv",
  "jerusalem",
  "beirut",
  "strike",
  "missile",
  "drone",
  "nuclear",
  "sanctions",
  "middle east",
  "netanyahu",
  "khamenei",
  "centcom",
  "pentagon",
  "islamic jihad",
  "west bank",
  "rafah",
  "lebanon",
  "syria",
  "iraq militia",
];

function isRelevant(text) {
  const lower = (text || "").toLowerCase();
  return CONFLICT_KEYWORDS.some((kw) => lower.includes(kw));
}

async function ingestSource(source) {
  const { enrichEvent, shouldRejectArticle } =
    await import("../lib/scoring.js");
  const { insertEvent } = await import("../lib/db.js");
  console.log(`\n📡 Fetching: ${source.name}`);
  let feed;

  try {
    feed = await parser.parseURL(source.url);
  } catch (err) {
    console.error(`  ❌ Failed to fetch ${source.name}: ${err.message}`);
    return { inserted: 0, skipped: 0, rejected: 0 };
  }

  let inserted = 0,
    skipped = 0,
    rejected = 0;

  for (const item of feed.items) {
    const title = item.title || "";
    const snippet = item.contentSnippet || item.summary || "";
    const fullText = `${title} ${snippet}`;

    // GATE 1: reject opinion, podcast, explainer, closed liveblogs, etc.
    if (shouldRejectArticle(title, snippet)) {
      rejected++;
      console.log(`  🚫 Rejected: ${title.slice(0, 70)}`);
      continue;
    }

    // GATE 2: must mention conflict keywords
    if (!isRelevant(fullText)) {
      skipped++;
      continue;
    }

    const rawEvent = {
      claim_text: fullText.trim(),
      source_name: source.name,
      source_url: item.link || item.guid || "",
      source_type: source.type,
      published_at: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
    };

    const enriched = enrichEvent(rawEvent);
    const result = await insertEvent(enriched);
    if (result) inserted++;
  }

  console.log(
    `  ✅ ${source.name}: ${inserted} inserted, ${rejected} rejected, ${skipped} irrelevant skipped`,
  );
  return { inserted, skipped, rejected };
}

async function runRSSIngestion() {
  const Parser = (await import("rss-parser")).default;
  const { enrichEvent, shouldRejectArticle } =
    await import("../lib/scoring.js");
  const { insertEvent } = await import("../lib/db.js");

  const parser = new Parser({
    timeout: 10000,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; OSINT-Bot/1.0)" },
  });
  console.log("🚀 Starting RSS Ingestion...");
  console.log(`⏰ ${new Date().toISOString()}\n`);

  let totalInserted = 0,
    totalRejected = 0;

  for (const source of RSS_SOURCES) {
    const { inserted, rejected } = await ingestSource(source);
    totalInserted += inserted;
    totalRejected += rejected;
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(
    `\n✨ RSS Ingestion complete: ${totalInserted} inserted, ${totalRejected} rejected`,
  );
}

runRSSIngestion().catch(console.error);
