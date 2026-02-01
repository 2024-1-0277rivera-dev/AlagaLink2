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
      <div className="w-full h-[420px] mb-4 relative overflow-hidden">
        {/* Stacked missing images (single large highlight, fades) */}
        {missing.map((m, i) => {
          const visible = i === index;
          const hours = calcHoursMissing(m.timeMissing);
          const isUrgent = hours >= 24;
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out transform-gpu ${visible ? 'opacity-100 z-20' : 'opacity-0 z-10'} group`}
              aria-label={`View details for ${m.name}`}
            >
              <img src={m.photoUrl || `https://picsum.photos/seed/${m.id}/1200/900`} alt={m.name} className="w-full h-full object-cover" />

              <div className="absolute left-6 bottom-6 right-6 p-4">
                <div className="flex items-start justify-between">
                  <div className="text-white drop-shadow-lg">
                    <h3 className="text-white text-2xl font-black mb-1">{m.name}</h3>
                    <p className="text-xs text-white/90">Last seen: <span className="font-black">{m.lastSeen}</span></p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-alaga-blue text-white'}`}>
                      {isUrgent ? 'URGENT' : `${Math.max(1, calcHoursMissing(m.timeMissing))}h Missing`}
                    </div>
                    <div className="mt-2 text-xs text-white/80">Tap image for full profile & contact</div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Indicator dots */}
        {missing.length > 1 && (
          <div className="absolute left-4 top-4 flex gap-2">
            {missing.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/30'}`}></span>
            ))}
          </div>
        )}
      </div>

      {/* Found persons row (smaller tiles, multiple columns) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 items-start">
        {found.map(f => (
          <button key={f.id} onClick={() => setSelected(f)} className="overflow-hidden rounded-md group">
            <img src={f.photoUrl || `https://picsum.photos/seed/${f.id}/400/300`} alt={f.name} className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" />
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
