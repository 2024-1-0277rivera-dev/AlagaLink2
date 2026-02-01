'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { LostReport } from '../../types';
import CaseDetailModal from './CaseDetailModal';
import { MOCK_MISSING } from '../../mockData/lost-found/missing';
import { MOCK_FOUND } from '../../mockData/lost-found/found';

const AUTO_ROTATE_MS = 5000;

const calcHoursMissing = (time: string) => Math.floor((Date.now() - new Date(time).getTime()) / (1000 * 60 * 60));

const CommunityVigilCarousel: React.FC = () => {
  const missing = useMemo(() => MOCK_MISSING || [], []);
  const found = useMemo(() => MOCK_FOUND || [], []);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<LostReport | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = React.useRef<number | null>(null);

  useEffect(() => {
    // Auto rotate unless paused
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!isPaused && missing.length > 1) {
      timerRef.current = window.setInterval(() => {
        setIndex(i => (i + 1) % Math.max(1, missing.length));
      }, AUTO_ROTATE_MS);
    }
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [missing.length, isPaused]);

  // Keyboard navigation (left/right arrows)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setIndex(i => (i + 1) % Math.max(1, missing.length));
      }
      if (e.key === 'ArrowLeft') {
        setIndex(i => (i - 1 + Math.max(1, missing.length)) % Math.max(1, missing.length));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [missing.length]);

  if (missing.length === 0 && found.length === 0) return null;

  return (
    <div className="w-full p-0 bg-transparent" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} tabIndex={0}>
      <div className="w-full h-[520px] mb-6 relative overflow-hidden">
        {/* Missing person slide: left image card with right info card */}
        {missing.map((m, i) => {
          const visible = i === index;
          const hours = calcHoursMissing(m.timeMissing);
          const urgencyLevel = hours >= 72 ? 'red' : hours >= 24 ? 'red' : hours >= 6 ? 'amber' : 'blue';
          const urgencyClasses = urgencyLevel === 'red' ? 'bg-red-600 text-white' : urgencyLevel === 'amber' ? 'bg-amber-500 text-white' : 'bg-alaga-blue text-white';

          return (
            <div key={m.id} className={`absolute inset-0 w-full h-full transition-opacity duration-800 ease-in-out transform-gpu ${visible ? 'opacity-100 z-20' : 'opacity-0 z-10'}`} aria-hidden={!visible}>
              <div className="absolute inset-0 w-full h-full overflow-hidden flex items-stretch gap-8">

                {/* LEFT: Image card (smaller) */}
                <button onClick={() => setSelected(m)} className={`w-2/5 h-full relative overflow-hidden rounded-[14px] shadow-2xl transform-gpu transition-transform duration-[12000ms] ease-in-out ${visible ? 'scale-105' : 'scale-100'}`} aria-label={`View photo of ${m.name}`}>
                  <img src={m.photoUrl || `https://picsum.photos/seed/${m.id}/1600/1000`} alt={m.name} className="w-full h-full object-cover object-center rounded-[14px] filter brightness-[1.06] contrast-[1.04]" />

                  {/* Section icon inside image (top-left) */}
                  <div className="absolute top-6 left-6 z-40">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-red-500 text-lg shadow-lg">
                      <i className="fa-solid fa-person-circle-question"></i>
                    </div>
                  </div>
                </button>

                {/* RIGHT: expanded info card */}
                <div className="w-3/5 h-full flex items-center">
                  <div className={`w-full p-8 rounded-[12px] bg-white dark:bg-alaga-charcoal shadow-lg transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'} transition-all duration-700`}> 
                    <h3 className="text-5xl font-extrabold mb-3 text-alaga-navy dark:text-white drop-shadow-lg">{m.name}</h3>
                    <p className="text-lg opacity-80 mb-1"><span className="font-black">Last seen:</span> <span className="font-semibold">{m.lastSeen}</span></p>
                    <p className="text-lg opacity-80 mb-1"><span className="font-black">Disability:</span> <span className="font-semibold">{m.description}</span></p>
                    <p className="text-lg opacity-80 mb-3"><span className="font-black">Address:</span> <span className="font-semibold">{m.lastSeen}</span></p>

                    <div className="mt-6 flex items-center gap-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest ${urgencyClasses} ${urgencyLevel === 'red' ? 'animate-pulse shadow-lg' : 'shadow-sm'}`}>{urgencyLevel === 'red' ? 'URGENT' : `${Math.max(1, hours)}h`}</div>
                      <div className="text-sm opacity-70">Tap to open full profile</div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          );
        })}


      </div>

      {/* Slide indicators (centered) */}
      {missing.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {missing.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full ${i === index ? 'bg-alaga-blue' : 'bg-white/40'}`} aria-label={`Show slide ${i + 1}`}></button>
          ))}
        </div>
      )}

      {/* Found persons mini indicator */}
      <div className="mt-4 flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-alaga-teal text-alaga-navy font-black text-xs">Found • {found.length}</div>
          <div className="flex items-center gap-2">
            {found.slice(0, 6).map(f => (
              <button key={f.id} onClick={() => setSelected(f)} className="w-10 h-10 overflow-hidden rounded-full ring-1 ring-white/10" aria-label={`Preview ${f.name}`}>
                <img src={f.photoUrl || `https://picsum.photos/seed/${f.id}/200/300`} alt={f.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm opacity-70">{found.length > 6 ? `+${found.length - 6} more` : ''}</div>
      </div>



      {selected && (
        <CaseDetailModal report={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default CommunityVigilCarousel;
