import { supabase } from "./supabaseClient.js";

export async function isDuplicate(sourceUrl, claimText) {
  const { data: urlMatch } = await supabase
    .from("events")
    .select("id")
    .eq("source_url", sourceUrl)
    .limit(1);

  if (urlMatch && urlMatch.length > 0) return true;

  const textSnippet = claimText.slice(0, 100);
  const { data: textMatch } = await supabase
    .from("events")
    .select("id")
    .ilike("claim_text", `${textSnippet}%`)
    .limit(1);

  return textMatch && textMatch.length > 0;
}

export async function checkAndCorroborate(claimText, country, eventType) {
  const keywords = claimText.split(" ").slice(0, 5).join(" ");

  const { data } = await supabase
    .from("events")
    .select("id, corroboration_count, confidence_score")
    .eq("country", country)
    .eq("event_type", eventType)
    .ilike("claim_text", `%${keywords}%`)
    .limit(1);

  if (data && data.length > 0) {
    const existing = data[0];
    const newCount = (existing.corroboration_count || 1) + 1;
    const newConfidence = Math.min(10, existing.confidence_score + 0.5);

    await supabase
      .from("events")
      .update({
        corroboration_count: newCount,
        confidence_score: newConfidence,
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return true;
  }
  return false;
}

export async function upsertActor(actorName, country) {
  if (!actorName) return;

  const { data: existing } = await supabase
    .from("actors")
    .select("id, event_count")
    .eq("name", actorName)
    .limit(1);

  if (existing && existing.length > 0) {
    await supabase
      .from("actors")
      .update({ event_count: (existing[0].event_count || 0) + 1 })
      .eq("name", actorName);
  } else {
    await supabase.from("actors").insert({
      name: actorName,
      country: country || "Unknown",
      actor_type: "other",
      threat_level: "medium",
      event_count: 1,
    });
  }
}

export async function updateActorRelation(
  actor1,
  actor2,
  interactionType,
  domain,
  eventId,
) {
  if (!actor1 || !actor2) return;

  const [a1, a2] = [actor1, actor2].sort();

  const { data: existing } = await supabase
    .from("actor_relations")
    .select("id, interaction_count")
    .eq("actor_1", a1)
    .eq("actor_2", a2)
    .eq("interaction_type", interactionType)
    .limit(1);

  if (existing && existing.length > 0) {
    await supabase
      .from("actor_relations")
      .update({
        interaction_count: (existing[0].interaction_count || 1) + 1,
        latest_event_id: eventId,
        last_interaction_at: new Date().toISOString(),
      })
      .eq("id", existing[0].id);
  } else {
    await supabase.from("actor_relations").insert({
      actor_1: a1,
      actor_2: a2,
      interaction_type: interactionType,
      interaction_count: 1,
      domain,
      latest_event_id: eventId,
      last_interaction_at: new Date().toISOString(),
    });
    // console.log("inserted called updateActorRelation");
  }
}

export async function insertEvent(enrichedEvent) {
  // 1. Check duplicate
  const dup = await isDuplicate(
    enrichedEvent.source_url,
    enrichedEvent.claim_text,
  );
  if (dup) {
    console.log(`⏭  Duplicate skipped: ${enrichedEvent.source_url}`);
    return null;
  }

  // 2. Check corroboration
  const corroborated = await checkAndCorroborate(
    enrichedEvent.claim_text,
    enrichedEvent.country,
    enrichedEvent.event_type,
  );
  if (corroborated) {
    console.log(
      `🔗 Corroboration updated for: ${enrichedEvent.claim_text.slice(0, 60)}`,
    );
    return null;
  }

  // 3. Insert event
  const { data, error } = await supabase
    .from("events")
    .insert(enrichedEvent)
    .select();

  if (error) {
    console.error("Insert error:", error.message);
    return null;
  }

  const insertedEvent = data[0];
  console.log(`Inserted: ${enrichedEvent.claim_text.slice(0, 60)}...`);

  // 4. Upsert actors
  await upsertActor(enrichedEvent.actor_1, enrichedEvent.country);
  await upsertActor(enrichedEvent.actor_2, enrichedEvent.country);

  // 5. Update actor relations (D3 edges)
  if (enrichedEvent.actor_1 && enrichedEvent.actor_2) {
    await updateActorRelation(
      enrichedEvent.actor_1,
      enrichedEvent.actor_2,
      enrichedEvent.actor_action || "interacted",
      enrichedEvent.domain,
      insertedEvent.id,
    );
  }

  return insertedEvent;
}
// ============================================
// TEST MODE - NO DATABASE
// ============================================

// Mock duplicate check
// export async function isDuplicate() {
//   return false
// }

// // Mock corroboration
// export async function checkAndCorroborate() {
//   return false
// }

// // Mock actor update
// export async function upsertActor(actorName, country) {
//   if (!actorName) return
//   console.log(`Actor detected: ${actorName} (${country})`)
// }

// // Mock actor relations
// export async function updateActorRelation(actor1, actor2) {
//   if (!actor1 || !actor2) return
//   console.log(` Relation: ${actor1} ↔ ${actor2}`)
// }

// // Master insert function
// export async function insertEvent(enrichedEvent) {
//   console.log("\n==============================")
//   console.log("FINAL EVENT:")
//   console.log(JSON.stringify(enrichedEvent, null, 2))

//   // Simulate actor processing
//   await upsertActor(enrichedEvent.actor_1, enrichedEvent.country)
//   await upsertActor(enrichedEvent.actor_2, enrichedEvent.country)

//   if (enrichedEvent.actor_1 && enrichedEvent.actor_2) {
//     await updateActorRelation(
//       enrichedEvent.actor_1,
//       enrichedEvent.actor_2
//     )
//   }

//   console.log("==============================\n")

//   return enrichedEvent
// }
