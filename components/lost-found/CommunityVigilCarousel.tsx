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
      <div className="w-full h-[420px] mb-6 relative overflow-hidden">
        {/* Missing person large highlight: left image, right details (slide + fade) */}
        {missing.map((m, i) => {
          const visible = i === index;
          const hours = calcHoursMissing(m.timeMissing);
          const isUrgent = hours >= 24;

          return (
            <div
              key={m.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out transform-gpu ${visible ? 'opacity-100 z-20' : 'opacity-0 z-10'} flex items-center`}
              aria-hidden={!visible}
            >
              {/* Left: Full-length image */}
              <button onClick={() => setSelected(m)} className={`w-3/5 h-full overflow-hidden rounded-[12px] ${visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'} transition-transform duration-700 ease-in-out`} aria-label={`View photo of ${m.name}`}>
                <img src={m.photoUrl || `https://picsum.photos/seed/${m.id}/1200/1600`} alt={m.name} className="w-full h-full object-cover rounded-[12px]" />
              </button>

              {/* Right: Sliding details */}
              <div className="w-2/5 h-full pl-6 pr-2">
                <div className={`h-full flex flex-col justify-between transition-transform duration-700 ease-in-out ${visible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}>
                  <div>
                    <h3 className="text-3xl font-black mb-2 text-center md:text-left text-alaga-navy dark:text-white">{m.name}</h3>
                    <p className="text-sm opacity-70 mb-2"><span className="font-black">Last seen:</span> {m.lastSeen}</p>
                    <p className="text-sm opacity-70 mb-2"><span className="font-black">Disability:</span> {m.description}</p>
                    <p className="text-sm opacity-70 mb-2"><span className="font-black">Address:</span> {m.lastSeen}</p>
                    <div className="mt-4">
                      <span className={`px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-widest ${isUrgent ? 'bg-red-500 text-white' : 'bg-alaga-blue text-white'}`}>
                        {isUrgent ? 'URGENT' : `${Math.max(1, hours)}h Missing`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button onClick={() => setSelected(m)} className="px-4 py-3 bg-alaga-blue text-white rounded-lg font-black">View Full Profile</button>
                    <button onClick={() => alert('Share functionality not implemented in mock')} className="px-3 py-3 border rounded-lg font-black text-sm">Share</button>
                  </div>
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

      {/* Found persons row (smaller tiles, multiple columns) */}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 items-start">
        {found.map(f => (
          <button key={f.id} onClick={() => setSelected(f)} className="overflow-hidden rounded-[12px] group shadow-sm hover:shadow-md transition-shadow duration-200" aria-label={`View details for ${f.name}`}>
            <img src={f.photoUrl || `https://picsum.photos/seed/${f.id}/400/600`} alt={f.name} className="w-full h-36 object-cover rounded-[12px]" />
            <div className="p-2 text-xs text-center font-black truncate">{f.name}</div>
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
