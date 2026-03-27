"use client";
import { useState, useEffect, useCallback } from "react";

export function useStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      setData(await (await fetch("/api/stats")).json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 120_000);
    return () => clearInterval(t);
  }, [load]);
  return { data, loading, refetch: load };
}

// export function useEvents(filters = {}) {
//   const [events, setEvents]   = useState([]);
//   const [loading, setLoading] = useState(true);
//   const key = JSON.stringify(filters);
//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const p = new URLSearchParams();
//       if (filters.domain)       p.set('domain', filters.domain);
//       if (filters.min_severity) p.set('min_severity', String(filters.min_severity));
//       if (filters.escalation)   p.set('escalation', 'true');
//       if (filters.search)       p.set('search', filters.search);
//       p.set('limit', String(filters.limit || 80));
//       const j = await (await fetch('/api/events?' + p)).json();
//       setEvents(j.events || []);
//     } catch (e) { console.error(e); }
//     finally { setLoading(false); }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [key]);
//   useEffect(() => { load(); }, [load]);
//   return { events, loading, refetch: load };
// }
export function useEvents(filters = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const key = JSON.stringify(filters);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.domain) p.set("domain", filters.domain);
      if (filters.min_severity)
        p.set("min_severity", String(filters.min_severity));
      if (filters.escalation) p.set("escalation", "true");
      if (filters.search) p.set("search", filters.search);
      p.set("limit", String(filters.limit || 80));
      p.set("offset", String(filters.offset || 0));
      const j = await (await fetch("/api/events?" + p)).json();
      setTotal(j.total || 0);
      setEvents(j.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    load();
  }, [load]);
  return { events, total, loading, refetch: load };
}

export function useActors() {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/actors")
      .then((r) => r.json())
      .then((j) => setActors(j.actors || []))
      .finally(() => setLoading(false));
  }, []);
  return { actors, loading };
}

export function useRelations() {
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/relations")
      .then((r) => r.json())
      .then((j) => setRelations(j.relations || []))
      .finally(() => setLoading(false));
  }, []);
  return { relations, loading };
}
