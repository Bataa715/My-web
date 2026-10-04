'use client';

import { useEffect, useMemo, useState } from 'react';

const COLORS = ['#c41212', '#111111', '#15803d', '#b45309', '#e5483a', '#cfc9bd'];

/**
 * Хамааралгүй (dependency-free) confetti баяр. `show` үнэн болмогц ~2.2 сек
 * буурч, дараа нь өөрөө алга болно.
 */
export function Confetti({ show }: { show: boolean }) {
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    if (!show) return;
    setAlive(true);
    const t = window.setTimeout(() => setAlive(false), 2400);
    return () => window.clearTimeout(t);
  }, [show]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.2,
        size: 6 + Math.random() * 6,
        rounded: Math.random() > 0.5,
      })),
    [],
  );

  if (!alive) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: p.rounded ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
          }}
        />
      ))}
    </div>
  );
}
