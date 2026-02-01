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
        {/* Missing person hero-style slides: full-bleed image with info overlay */}
        {missing.map((m, i) => {
          const visible = i === index;
          const hours = calcHoursMissing(m.timeMissing);
          const urgencyLevel = hours >= 72 ? 'red' : hours >= 24 ? 'red' : hours >= 6 ? 'amber' : 'blue';
          const urgencyClasses = urgencyLevel === 'red' ? 'bg-red-600 text-white' : urgencyLevel === 'amber' ? 'bg-amber-500 text-white' : 'bg-alaga-blue text-white';

          return (
            <div key={m.id} className={`absolute inset-0 w-full h-full transition-opacity duration-800 ease-in-out transform-gpu ${visible ? 'opacity-100 z-20' : 'opacity-0 z-10'}`} aria-hidden={!visible}>
              {/* Background image */}
              <div className={`absolute inset-0 w-full h-full overflow-hidden ${visible ? 'scale-100 opacity-100' : 'scale-102 opacity-80'} transition-transform duration-900`}>
                <img src={m.photoUrl || `https://picsum.photos/seed/${m.id}/1600/1000`} alt={m.name} className="w-full h-full object-cover object-center rounded-[10px] filter brightness-[1.05] contrast-[1.04]" />

                {/* Gradient overlay to make text readable & create separation */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none"></div>

                {/* Section icon inside image (top-left) */}
                <div className="absolute top-6 left-6 z-40">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-red-500 text-lg shadow-lg">
                    <i className="fa-solid fa-person-circle-question"></i>
                  </div>
                </div>

                {/* Overlayed info (align right) */}
                <div className={`absolute right-8 top-1/4 max-w-xl p-6 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'} transition-all duration-700` }>
                  <h3 className="text-5xl md:text-6xl font-extrabold leading-tight text-white mb-3 drop-shadow-lg">{m.name}</h3>
                  <p className="text-lg text-white/90 mb-2"><span className="font-black">Last seen:</span> <span className="font-semibold">{m.lastSeen}</span></p>
                  <p className="text-lg text-white/90 mb-2"><span className="font-black">Disability:</span> <span className="font-semibold">{m.description}</span></p>
                  <p className="text-lg text-white/90 mb-4"><span className="font-black">Address:</span> <span className="font-semibold">{m.lastSeen}</span></p>

                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest ${urgencyClasses}`}>{urgencyLevel === 'red' ? 'URGENT' : `${Math.max(1, hours)}h Missing`}</div>
                    <div className="text-sm text-white/80">Tap to view full profile & contact</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Dots indicator + keyboard hint */}
        {missing.length > 1 && (
          <div className="absolute left-4 bottom-6 flex items-center gap-3 z-50">
            {missing.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`} aria-label={`Show slide ${i + 1}`}></button>
            ))}
            <div className="ml-4 text-xs text-white/70">Use ← → to navigate, hover to pause</div>
          </div>
        )}
      </div>

      {/* Found persons mini indicator */}
      <div className="mt-2 flex items-center justify-between mb-3">
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

      {/* Found persons grid */}
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-start">
        {found.map(f => (
          <button key={f.id} onClick={() => setSelected(f)} className="overflow-hidden rounded-[14px] group shadow-sm hover:shadow-md transition-shadow duration-200 relative" aria-label={`View details for ${f.name}`}>
            <img src={f.photoUrl || `https://picsum.photos/seed/${f.id}/600/900`} alt={f.name} className="w-full h-40 object-cover object-center rounded-[14px]" />
            <div className="absolute left-0 right-0 bottom-0 p-2 bg-gradient-to-t from-black/40 to-transparent rounded-bl-[14px] rounded-br-[14px]">
              <div className="text-xs font-black text-white truncate">{f.name}</div>
              <div className="text-[10px] text-white/80">{f.status}</div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <CaseDetailModal report={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default CommunityVigilCarousel;
