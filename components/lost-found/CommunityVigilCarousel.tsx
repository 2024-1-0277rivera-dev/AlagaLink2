'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
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

          return (
            <div key={m.id} className={`absolute inset-0 w-full h-full transition-opacity duration-800 ease-in-out transform-gpu ${visible ? 'opacity-100 z-20' : 'opacity-0 z-10'}`} aria-hidden={!visible}>
              <div className="absolute inset-0 w-full h-full overflow-hidden flex items-stretch gap-8">

                {/* LEFT: Image card (smaller, more rounded) */}
                <button onClick={() => setSelected(m)} className={`w-2/5 h-full relative overflow-hidden rounded-[24px] shadow-2xl transform-gpu transition-transform duration-[12000ms] ease-in-out ${visible ? 'scale-105' : 'scale-100'}`} aria-label={`View photo of ${m.name}`}>
                  <div className="absolute inset-0">
                    <Image src={m.photoUrl || `https://picsum.photos/seed/${m.id}/1600/1000`} alt={m.name} fill className="w-full h-full object-cover object-center rounded-[24px] filter brightness-[1.06] contrast-[1.04]" sizes="(min-width:1024px) 50vw, 100vw" />
                  </div>

                  {/* Section icon inside image (top-left) */}
                  <div className="absolute top-4 left-4 z-40">
                    <div className="w-11 h-11 bg-white/12 rounded-xl flex items-center justify-center text-red-500 text-lg shadow-md">
                      <i className="fa-solid fa-person-circle-question"></i>
                    </div>
                  </div>
                </button>

                {/* RIGHT: expanded info (not enclosed) */}
                <div className="w-3/5 h-full flex items-center">
                  <div onClick={() => setSelected(m)} role="button" tabIndex={0} className={`w-full relative transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'} transition-all duration-700 cursor-pointer`}>

                    {/* Faint decorative icon behind content for aesthetic */}
                    <i aria-hidden className="fa-solid fa-person-circle-question absolute -right-8 -top-10 text-[220px] text-black/6 dark:text-white/6 pointer-events-none select-none"></i>

                    <div className="relative z-10">
                      <h3 className="text-7xl md:text-8xl lg:text-9xl font-extrabold mb-2 leading-tight text-alaga-navy dark:text-white">{m.name}</h3>

                      <p className="text-sm font-bold text-gray-400 dark:text-gray-300 mb-4 uppercase tracking-wide">{m.description}</p>

                      <div className="text-sm text-gray-700 dark:text-gray-200 space-y-2 mb-4">
                        <div><span className="font-black">Last seen:</span> <span className="font-medium">{m.lastSeen} • {m.missingNarrative?.when || `${Math.max(1, hours)}h ago`}</span></div>
                        <div><span className="font-black">Clothes:</span> <span className="font-medium">{m.clothes || 'N/A'}</span></div>
                        <div><span className="font-black">Body type:</span> <span className="font-medium">{m.bodyType || 'N/A'}</span> &nbsp; <span className="font-black">Height:</span> <span className="font-medium">{m.height || 'N/A'}</span></div>
                        {m.dissemination?.context && <div><span className="font-black">Notes:</span> <span className="font-medium">{m.dissemination.context}</span></div>}
                      </div>

                      <div className="mt-6">
                        <div className={`inline-block px-4 py-2 rounded-lg text-sm font-black ${hours < 24 ? 'bg-alaga-blue text-white' : 'bg-red-600 text-white'}`}>{hours < 24 ? `${hours}h Missing` : `${Math.floor(hours/24)}d ${hours%24}h Missing`}</div>
                      </div>
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
        <div className="mt-6 flex items-center justify-center gap-4" role="tablist" aria-label="Missing person slides">
          {missing.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Show slide ${i + 1}`} role="tab" aria-selected={i === index} className={`${i === index ? 'w-5 h-5 rounded-full bg-alaga-blue shadow-md' : 'w-2 h-2 rounded-full border-2 border-white/40 bg-transparent'}`}></button>
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
                <Image src={f.photoUrl || `https://picsum.photos/seed/${f.id}/200/300`} alt={f.name} width={40} height={40} className="w-full h-full object-cover" />
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
