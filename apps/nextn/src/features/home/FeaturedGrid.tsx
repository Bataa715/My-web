'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AOT_IMAGES } from '@/lib/aot-images';
import { cn } from '@/lib/utils';

const pickups = [
  { tag: 'ABOUT', title: 'Миний тухай', href: '/#about' },
  { tag: 'TOOLS', title: 'Хэрэгслүүд', href: '/#tools' },
  { tag: 'SPECIAL', title: 'Англи хэл', href: '/tools/english' },
  { tag: 'SPECIAL', title: 'Япон хэл', href: '/tools/japanese' },
];

const galleryImages = [
  { image: AOT_IMAGES.portal, title: 'Portal' },
  { image: AOT_IMAGES.sky, title: 'Sky' },
  { image: AOT_IMAGES.walls, title: 'Walls' },
  { image: AOT_IMAGES.flowers, title: 'Flowers' },
  { image: AOT_IMAGES.meadow, title: 'Meadow' },
  { image: AOT_IMAGES.pair, title: 'Pair' },
  { image: AOT_IMAGES.end, title: 'End' },
  { image: AOT_IMAGES.home, title: 'Cast' },
];

function scrollToHash(href: string, event: React.MouseEvent) {
  if (!href.startsWith('/#')) return;
  const el = document.getElementById(href.slice(2));
  if (!el) return;
  event.preventDefault();
  el.scrollIntoView({ behavior: 'smooth' });
  window.history.replaceState(null, '', href);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export default function FeaturedGrid() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setOffset(i => (i + 1) % galleryImages.length),
      6500
    );
    return () => clearInterval(t);
  }, []);

  const visible = [0, 1, 2].map(
    i => galleryImages[(offset + i) % galleryImages.length]
  );

  return (
    <div className="relative z-10 bg-[#f3f1ee] text-[#111]">
      <section id="featured" className="px-4 py-20 sm:px-8">
        <h2 className="portal-title">Pick up</h2>
        <ul className="mx-auto mt-16 max-w-5xl divide-y divide-[#111]">
          {pickups.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={event => scrollToHash(item.href, event)}
                className="group flex items-center gap-4 py-7 sm:gap-10"
              >
                <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
                  {item.tag}
                </span>
                <span className="flex-1 text-base sm:text-lg">{item.title}</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 pb-24 sm:px-8">
        <h2 className="portal-title">Gallery</h2>
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-0 md:grid-cols-3">
          {visible.map((card, i) => (
            <div
              key={`${card.image}-${offset}-${i}`}
              className="relative aspect-16/10 overflow-hidden bg-[#111]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center animate-in fade-in duration-1000"
                style={{ backgroundImage: `url(${card.image})` }}
              />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl justify-center gap-2">
          {galleryImages.map((img, i) => (
            <button
              key={img.image}
              type="button"
              aria-label={img.title}
              onClick={() => setOffset(i)}
              className={cn(
                'h-1.5 w-6',
                i === offset ? 'bg-[#c41212]' : 'bg-[#111]/20'
              )}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
