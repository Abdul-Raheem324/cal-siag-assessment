// 'use client';

// const NAV = [
//   { id: 'overview', label: 'Overview', icon: LayoutIcon  },
//   { id: 'events',   label: 'Events',   icon: ListIcon    },
//   { id: 'actors',   label: 'Actors',   icon: NetworkIcon },
//   { id: 'sources',  label: 'Sources',  icon: SourceIcon  },
// ];


// export default function MobileTabBar({ activeView, onViewChange }) {
//   return (
//     <nav
//       className="flex md:hidden"
//       style={{
//         position:    'fixed',
//         bottom:      0,
//         left:        0,
//         right:       0,
//         zIndex:      50,
//         // display:     'hidden',
//         alignItems:  'stretch',
//         background:  '#111827',
//         borderTop:   '1px solid #2e3d58',
//         paddingBottom: 'env(safe-area-inset-bottom, 0px)',
//       }}
//     >
//       {NAV.map(item => {
//         const Icon   = item.icon;
//         const active = activeView === item.id;
//         return (
//           <button
//             key={item.id}
//             onClick={() => onViewChange(item.id)}
//             style={{
//               flex:           1,
//               display:        'flex',
//               flexDirection:  'column',
//               alignItems:     'center',
//               justifyContent: 'center',
//               gap:            4,
//               paddingTop:     10,
//               paddingBottom:  10,
//               cursor:         'pointer',
//               background:     'transparent',
//               border:         'none',
//               position:       'relative',
//               transition:     'background 0.15s',
//             }}
//           >
//             {/* Active top indicator bar */}
//             {active && (
//               <span
//                 style={{
//                   position:    'absolute',
//                   top:         0,
//                   left:        '50%',
//                   transform:   'translateX(-50%)',
//                   width:       28,
//                   height:      2,
//                   borderRadius: 2,
//                   background:  'linear-gradient(90deg, #4d94ff, #b880ff)',
//                 }}
//               />
//             )}

//             <Icon
//               style={{
//                 width:  20,
//                 height: 20,
//                 color:  active ? '#4d94ff' : '#627a9e',
//                 filter: active ? 'drop-shadow(0 0 5px rgba(77,148,255,0.55))' : 'none',
//                 transform: active ? 'scale(1.1)' : 'scale(1)',
//                 transition: 'all 0.2s',
//               }}
//             />
//             <span
//               style={{
//                 fontSize:   10,
//                 fontWeight: 500,
//                 color:      active ? '#4d94ff' : '#627a9e',
//                 transition: 'color 0.2s',
//               }}
//             >
//               {item.label}
//             </span>
//           </button>
//         );
//       })}
//     </nav>
//   );
// }

// function LayoutIcon({ style }) {
//   return (
//     <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
//       <rect x="3" y="3" width="7" height="7" rx="1.5"/>
//       <rect x="14" y="3" width="7" height="7" rx="1.5"/>
//       <rect x="14" y="14" width="7" height="7" rx="1.5"/>
//       <rect x="3" y="14" width="7" height="7" rx="1.5"/>
//     </svg>
//   );
// }
// function ListIcon({ style }) {
//   return (
//     <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
//       <line x1="8" y1="6" x2="21" y2="6"/>
//       <line x1="8" y1="12" x2="21" y2="12"/>
//       <line x1="8" y1="18" x2="21" y2="18"/>
//       <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none"/>
//       <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none"/>
//       <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none"/>
//     </svg>
//   );
// }
// function NetworkIcon({ style }) {
//   return (
//     <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
//       <circle cx="12" cy="5" r="2"/>
//       <circle cx="5" cy="19" r="2"/>
//       <circle cx="19" cy="19" r="2"/>
//       <line x1="12" y1="7" x2="5" y2="17"/>
//       <line x1="12" y1="7" x2="19" y2="17"/>
//       <line x1="5" y1="19" x2="19" y2="19"/>
//     </svg>
//   );
// }
// function SourceIcon({ style }) {
//   return (
//     <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
//       <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
//       <polyline points="14 2 14 8 20 8"/>
//       <line x1="8" y1="13" x2="16" y2="13"/>
//       <line x1="8" y1="17" x2="16" y2="17"/>
//     </svg>
//   );
// }
'use client';
import { useState } from 'react';

/*
 * 6 nav items don't all fit in a mobile bottom bar comfortably.
 * Show 4 primary tabs + a "More" button that reveals a mini drawer.
 * Primary: Summary, Events, Map, Overview
 * More: Actors, Sources
 */

const PRIMARY_NAV = [
  { id: 'summary',  label: 'Summary',  icon: SummaryIcon  },
  { id: 'events',   label: 'Events',   icon: ListIcon     },
  { id: 'map',      label: 'Map',      icon: MapIcon      },
  { id: 'overview', label: 'Overview', icon: LayoutIcon   },
];

const MORE_NAV = [
  { id: 'actors',  label: 'Actors',  icon: NetworkIcon },
  { id: 'sources', label: 'Sources', icon: SourceIcon  },
];

export default function MobileTabBar({ activeView, onViewChange }) {
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_NAV.some(n => n.id === activeView);

  function handleNav(id) {
    onViewChange(id);
    setMoreOpen(false);
  }

  return (
    <>
      {/* More drawer (slides up) */}
      {moreOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="md:hidden fixed bottom-16 left-0 right-0 z-50 rounded-t-2xl border-t border-x overflow-hidden"
            style={{ background: '#111827', borderColor: '#2e3d58' }}
          >
            {MORE_NAV.map(item => {
              const Icon   = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 cursor-pointer transition-all"
                  style={{ background: active ? 'rgba(77,148,255,0.1)' : 'transparent' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(46,61,88,0.5)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon style={{ width: 20, height: 20, color: active ? '#4d94ff' : '#adbedd' }} />
                  <span style={{ fontSize: 15, fontWeight: 500, color: active ? '#4d94ff' : '#f1f5ff' }}>
                    {item.label}
                  </span>
                  {active && (
                    <span className="ml-auto w-2 h-2 rounded-full"
                      style={{ background: '#4d94ff' }} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Bottom tab bar */}
      <nav
        className="flex md:hidden"
        style={{
          position:    'fixed',
          bottom:      0,
          left:        0,
          right:       0,
          zIndex:      50,
          // display:     'flex',
          alignItems:  'stretch',
          background:  '#111827',
          borderTop:   '1px solid #2e3d58',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {PRIMARY_NAV.map(item => {
          const Icon   = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setMoreOpen(false); onViewChange(item.id); }}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, paddingTop: 10, paddingBottom: 10,
                cursor: 'pointer', background: 'transparent', border: 'none',
                position: 'relative',
              }}
            >
              {active && (
                <span style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 28, height: 2, borderRadius: 2,
                  background: 'linear-gradient(90deg, #4d94ff, #b880ff)',
                }} />
              )}
              <Icon style={{
                width: 20, height: 20,
                color: active ? '#4d94ff' : '#627a9e',
                filter: active ? 'drop-shadow(0 0 5px rgba(77,148,255,0.55))' : 'none',
                transform: active ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s',
              }} />
              <span style={{
                fontSize: 10, fontWeight: 500,
                color: active ? '#4d94ff' : '#627a9e',
                transition: 'color 0.2s',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(v => !v)}
          style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 3, paddingTop: 10, paddingBottom: 10,
            cursor: 'pointer', background: 'transparent', border: 'none',
            position: 'relative',
          }}
        >
          {(isMoreActive || moreOpen) && (
            <span style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 28, height: 2, borderRadius: 2,
              background: 'linear-gradient(90deg, #4d94ff, #b880ff)',
            }} />
          )}
          <MoreIcon style={{
            width: 20, height: 20,
            color: (isMoreActive || moreOpen) ? '#4d94ff' : '#627a9e',
            transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'all 0.2s',
          }} />
          <span style={{
            fontSize: 10, fontWeight: 500,
            color: (isMoreActive || moreOpen) ? '#4d94ff' : '#627a9e',
          }}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}

/* ── Icons ── */
function SummaryIcon({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5"/>
      <polyline points="9 11 12 14 22 4"/>
      <path d="M16 17l2 2 4-4"/>
    </svg>
  );
}
function LayoutIcon({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}
function ListIcon({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function MapIcon({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}
function NetworkIcon({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="5" r="2"/>
      <circle cx="5" cy="19" r="2"/>
      <circle cx="19" cy="19" r="2"/>
      <line x1="12" y1="7" x2="5" y2="17"/>
      <line x1="12" y1="7" x2="19" y2="17"/>
      <line x1="5" y1="19" x2="19" y2="19"/>
    </svg>
  );
}
function SourceIcon({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  );
}
function MoreIcon({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  );
}