// 'use client';
// import { useState } from 'react';
// import Sidebar from './components/Sidebar';
// import EventsView from './components/EventsView';
// import OverviewView from './components/OverviewView';
// import ActorsView from './components/ActorsView';
// import SourcesView from './components/SourcesView';
// import { useActors, useEvents, useRelations, useStats } from './hooks/useData';
// import MobileTopBar from './components/MobileTopBar.jsx';
// import MobileTabBar from './components/Mobiletabbar';

// const PAGE_META = {
//   overview: { title: 'Overview',    sub: 'Situational summary and trends',         accent: '#4d94ff' },
//   events:   { title: 'Event Feed',  sub: 'All ingested events with filters',        accent: '#ff5370' },
//   actors:   { title: 'Actors',      sub: 'Tracked entities and relationship graph', accent: '#2ecc8e' },
//   sources:  { title: 'Sources',     sub: 'Data provenance and source reliability',  accent: '#ffaa3b' },
// };

// export default function Dashboard() {
//   const [view, setView]       = useState('overview');
//   // const [filters, setFilters] = useState({});
//   const [filters, setFilters] = useState({
//   limit: 20,
//   offset: 0,
// });
  
//   const { data: stats, loading: statsLoading } = useStats();
//   // console.log("Stats",stats)
//   // const { events, loading: eventsLoading }     = useEvents(filters);
//   const { events, total, loading: eventsLoading } = useEvents(filters);
//   console.log("events",events)
//   const { actors }                             = useActors();
//   const { relations }                          = useRelations();

//   // function patchFilters(patch) {
//   //   setFilters(prev => ({ ...prev, ...patch }));
//   // }
//   function patchFilters(patch) {
//   setFilters(prev => ({
//     ...prev,
//     ...patch,
//     offset: patch.offset !== undefined ? patch.offset : 0
//   }));
// }
//   const page = PAGE_META[view];

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen" style={{ background: '#0d1117' }}>

//       {/* ── Mobile top bar — only visible < md, spans full width in column layout ── */}
//       <MobileTopBar stats={stats} />

//       {/* ── Desktop sidebar — only visible ≥ md, sits as first column ── */}
//       <Sidebar activeView={view} onViewChange={setView} stats={stats} />

//       {/* ── Main content ── */}
//       <main className="flex-1 min-w-0 flex flex-col">

//         {/* Page header */}
//         <div
//           className="sticky top-0 z-20 border-b px-4 md:px-6 py-3 md:py-4 glass"
//           style={{ borderColor: '#2e3d58' }}
//         >
//           <div className="flex items-center justify-between gap-4">
//             <div>
//               <h1 className="text-base md:text-lg font-bold tracking-tight" style={{ color: '#f1f5ff' }}>
//                 {page.title}
//               </h1>
//               <p className="text-xs mt-0.5 hidden sm:block" style={{ color: '#627a9e' }}>{page.sub}</p>
//             </div>

//             {/* <div className="flex items-center gap-2 text-xs shrink-0">
//               <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border"
//                 style={{ background: 'rgba(46,204,142,0.1)', borderColor: 'rgba(46,204,142,0.28)', color: '#2ecc8e' }}>
//                 <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
//                 Live
//               </div>
//               <span className="hidden sm:block" style={{ color: '#627a9e' }}>Auto-refresh every 2 min</span>
//             </div> */}
//           </div>

//           {/* Accent line */}
//           <div
//             className="absolute bottom-0 left-0 right-0 h-px transition-all duration-500"
//             style={{ background: `linear-gradient(90deg, transparent, ${page.accent}60, transparent)` }}
//           />
//         </div>

//         {/* View content — pb-20 on mobile for bottom tab bar clearance */}
//         <div className="flex-1 px-4 md:px-6 py-5 overflow-auto pb-24 md:pb-6">
//           {statsLoading && view === 'overview' ? (
//             <LoadingSkeleton />
//           ) : view === 'overview' ? (
//             <OverviewView stats={stats} onNavigate={setView} />
//           ) : view === 'events' ? (
//             <EventsView total={total} events={events} loading={eventsLoading} filters={filters} onFilterChange={patchFilters} />
//           ) : view === 'actors' ? (
//             <ActorsView actors={actors} relations={relations} />
//           ) : view === 'sources' ? (
//             <SourcesView events={events} />
//           ) : null}
//         </div>
//       </main>

//       {/* ── Mobile bottom tab bar — fixed, only visible < md ── */}
//       <MobileTabBar activeView={view} onViewChange={setView} />
//     </div>
//   );
// }

// function LoadingSkeleton() {
//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         {[...Array(4)].map((_, i) => (
//           <div key={i} className="skeleton h-24" style={{ animationDelay: `${i * 80}ms` }} />
//         ))}
//       </div>
//       <div className="skeleton h-64" style={{ animationDelay: '200ms' }} />
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="skeleton h-48" style={{ animationDelay: '300ms' }} />
//         <div className="skeleton h-48" style={{ animationDelay: '360ms' }} />
//       </div>
//     </div>
//   );
// }
'use client';
import { useState } from 'react';
import Sidebar       from './components/Sidebar';
import MobileTopBar  from './components/MobileTopBar';
import EventsView    from './components/EventsView';
import OverviewView  from './components/OverviewView';
import ActorsView    from './components/ActorsView';
import SourcesView   from './components/SourcesView';
import { useActors, useEvents, useRelations, useStats } from './hooks/useData';
import MapView from './components/Mapview';
import MobileTabBar from './components/Mobiletabbar';
import SummaryView from './components/Summaryview';

const PAGE_META = {
  summary:  { title: 'Executive Summary', sub: 'Intelligence overview and key findings',      accent: '#b880ff' },
  overview: { title: 'Overview',          sub: 'Situational summary and trends',              accent: '#4d94ff' },
  events:   { title: 'Event Feed',        sub: 'All ingested events with filters',            accent: '#ff5370' },
  map:      { title: 'Location Map',      sub: 'Geographic distribution of conflict events',  accent: '#2ecc8e' },
  actors:   { title: 'Actors',            sub: 'Tracked entities and relationship graph',     accent: '#3ddcff' },
  sources:  { title: 'Sources',           sub: 'Data provenance and source reliability',      accent: '#ffaa3b' },
};

export default function Dashboard() {
  const [view, setView]       = useState('summary');
  // const [filters, setFilters] = useState({});
  const [filters, setFilters] = useState({
    limit: 20,
    offset: 0,
  });

  const { data: stats, loading: statsLoading } = useStats();
  // const { events, loading: eventsLoading }     = useEvents(filters);
  const { events, total, loading: eventsLoading } = useEvents(filters);
  const { actors }                             = useActors();
  const { relations }                          = useRelations();

  // Unfiltered events for summary/map
  const { events: allEvents } = useEvents({});

  // function patchFilters(patch) {
  //   setFilters(prev => ({ ...prev, ...patch }));
  // }
  function patchFilters(patch) {
  setFilters(prev => ({
    ...prev,
    ...patch,
    offset: patch.offset !== undefined ? patch.offset : 0
  }));
}

  const page = PAGE_META[view] || PAGE_META.summary;

  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ background: '#0d1117' }}>

      {/* Mobile top bar */}
      <MobileTopBar stats={stats} />

      {/* Desktop sidebar */}
      <Sidebar activeView={view} onViewChange={setView} stats={stats} />

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* Page header */}
        <div className="sticky top-0 z-20 border-b px-4 md:px-6 py-3 md:py-4 glass"
          style={{ borderColor: '#2e3d58' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight" style={{ color: '#f1f5ff' }}>
                {page.title}
              </h1>
              <p className="text-xs mt-0.5 hidden sm:block" style={{ color: '#627a9e' }}>{page.sub}</p>
            </div>
            {/* <div className="flex items-center gap-2 text-xs shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border"
                style={{ background: 'rgba(46,204,142,0.1)', borderColor: 'rgba(46,204,142,0.28)', color: '#2ecc8e' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
                Live
              </div>
              <span className="hidden sm:block" style={{ color: '#627a9e' }}>Auto-refresh every 2 min</span>
            </div> */}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px transition-all duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${page.accent}60, transparent)` }} />
        </div>

        {/* Content */}
        <div className="flex-1 px-4 md:px-6 py-5 overflow-auto pb-24 md:pb-6">
          {view === 'summary' ? (
            <SummaryView events={allEvents} stats={stats} onNavigate={setView} />
          ) : view === 'overview' ? (
            statsLoading ? <LoadingSkeleton /> : <OverviewView stats={stats} onNavigate={setView} />
          ) : view === 'events' ? (
            <EventsView total={total} events={events} loading={eventsLoading} filters={filters} onFilterChange={patchFilters} />
          ) : view === 'map' ? (
            <MapView events={allEvents} />
          ) : view === 'actors' ? (
            <ActorsView actors={actors} relations={relations} />
          ) : view === 'sources' ? (
            <SourcesView events={allEvents} />
          ) : null}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <MobileTabBar activeView={view} onViewChange={setView} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-24" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
      <div className="skeleton h-64" style={{ animationDelay: '200ms' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="skeleton h-48" style={{ animationDelay: '300ms' }} />
        <div className="skeleton h-48" style={{ animationDelay: '360ms' }} />
      </div>
    </div>
  );
}