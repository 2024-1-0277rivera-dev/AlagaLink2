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

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % Math.max(1, missing.length));
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [missing.length]);

  if (missing.length === 0 && found.length === 0) return null;

  return (
    <div className="w-full p-0 bg-transparent">
      <div className="w-full h-[460px] mb-6 relative overflow-hidden">
        {/* Missing person large highlight: left image, right details (slide + fade) */}
        {missing.map((m, i) => {
          const visible = i === index;
          const hours = calcHoursMissing(m.timeMissing);
          const isUrgent = hours >= 72 ? 'red' : hours >= 24 ? 'red' : hours >= 6 ? 'amber' : 'blue';

          const urgencyClasses = isUrgent === 'red' ? 'bg-red-600 text-white' : isUrgent === 'amber' ? 'bg-amber-500 text-white' : 'bg-alaga-blue text-white';

          return (
            <div
              key={m.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out transform-gpu ${visible ? 'opacity-100 z-20' : 'opacity-0 z-10'} flex items-stretch gap-6`}
              aria-hidden={!visible}
            >
              {/* LEFT: Image (appears first with fade-in from left) */}
              <div className={`w-3/5 h-full overflow-hidden rounded-[15px] relative ${visible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'} transition-all duration-700 ease-out`}
                   onClick={() => setSelected(m)} aria-label={`View photo of ${m.name}`}>
                <img src={m.photoUrl || `https://picsum.photos/seed/${m.id}/1200/1800`} alt={m.name} className="w-full h-full object-cover object-center filter brightness-[1.03] contrast-[1.02]" />

                {/* Blue gradient flowing from right to left to give imaginary separation */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-blue-700/40 to-transparent"></div>

                {/* Urgency badge on image */}
                <div className="absolute top-4 left-4 z-30">
                  <div className={`px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-widest ${urgencyClasses}`}>{isUrgent === 'red' ? 'URGENT' : `${Math.max(1, hours)}h Missing`}</div>
                </div>
              </div>

              {/* RIGHT: Details (slides in from left) */}
              <div className="w-2/5 h-full pr-2 flex items-center">
                <div className={`w-full h-full bg-white dark:bg-alaga-charcoal p-6 rounded-[12px] shadow-lg transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'} transition-all duration-700 ease-out`} onClick={() => setSelected(m)}>
                  <h3 className="text-4xl font-extrabold leading-tight mb-2 text-alaga-navy dark:text-white">{m.name}</h3>
                  <p className="text-sm opacity-70 mb-2"><span className="font-black">Last seen:</span> <span className="font-semibold">{m.lastSeen}</span></p>
                  <p className="text-sm opacity-70 mb-2"><span className="font-black">Disability:</span> <span className="font-semibold">{m.description}</span></p>
                  <p className="text-sm opacity-70 mb-2"><span className="font-black">Address:</span> <span className="font-semibold">{m.lastSeen}</span></p>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="text-xs font-black uppercase opacity-80">Status</div>
                    <div className="flex-1">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full ${isUrgent === 'red' ? 'bg-red-600 w-full' : isUrgent === 'amber' ? 'bg-amber-500 w-2/3' : 'bg-alaga-blue w-1/3'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-sm opacity-80">Tap the image or details to view full profile and contact information.</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicator dots */}
        {missing.length > 1 && (
          <div className="absolute left-4 top-4 flex gap-2 z-40">
            {missing.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/30'}`} aria-label={`Show slide ${i + 1}`}></button>
            ))}
          </div>
        )}
      </div>

      {/* Found persons row (improved tiles) */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-start">
        {found.map(f => (
          <button key={f.id} onClick={() => setSelected(f)} className="overflow-hidden rounded-[15px] group shadow-sm hover:shadow-md transition-shadow duration-200 relative" aria-label={`View details for ${f.name}`}>
            <img src={f.photoUrl || `https://picsum.photos/seed/${f.id}/600/900`} alt={f.name} className="w-full h-40 object-cover object-center rounded-[15px]" />
            <div className="absolute left-0 right-0 bottom-0 p-2 bg-gradient-to-t from-black/40 to-transparent rounded-bl-[15px] rounded-br-[15px]">
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
