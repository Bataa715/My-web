'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditMode } from '@/providers/EditModeContext';
import { useGallery } from './useGallery';

const pickups = [
  { tag: 'ABOUT', title: 'Миний тухай', href: '/#about' },
  { tag: 'TOOLS', title: 'Хэрэгслүүд', href: '/#tools' },
  { tag: 'SPECIAL', title: 'Англи хэл', href: '/tools/english' },
  { tag: 'SPECIAL', title: 'Япон хэл', href: '/tools/japanese' },
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
  const { isEditMode } = useEditMode();
  const gallery = useGallery();
  const galleryImages = gallery.images;
  const [offset, setOffset] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const t = setInterval(
      () => setOffset(i => (i + 1) % galleryImages.length),
      6500
    );
    return () => clearInterval(t);
  }, [galleryImages.length]);

  const count = Math.min(3, galleryImages.length);
  const visible = Array.from(
    { length: count },
    (_, i) => galleryImages[(offset + i) % galleryImages.length]
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
        <div
          className={cn(
            'mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-0',
            count === 2 && 'md:grid-cols-2',
            count >= 3 && 'md:grid-cols-3'
          )}
        >
          {visible.map((card, i) => (
            <div
              key={`${card.id}-${offset}-${i}`}
              className="relative aspect-16/10 overflow-hidden bg-[#111]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center animate-in fade-in duration-1000"
                style={{ backgroundImage: `url(${card.url})` }}
              />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl justify-center gap-2">
          {galleryImages.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Зураг ${i + 1}`}
              onClick={() => setOffset(i)}
              className={cn(
                'h-1.5 w-6',
                i === offset ? 'bg-[#c41212]' : 'bg-[#111]/20'
              )}
            />
          ))}
        </div>

        {isEditMode && (
          <div className="mx-auto mt-10 max-w-6xl border border-dashed border-[#111]/40 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c41212]">
                Gallery зураг засах
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {gallery.isCustom && (
                  <button
                    type="button"
                    onClick={gallery.resetToDefault}
                    className="flex items-center gap-1.5 text-xs text-[#111]/55 hover:text-[#c41212]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Анхны зургууд руу буцаах
                  </button>
                )}
                <button
                  type="button"
                  disabled={gallery.busy}
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 border border-[#111] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-[#111] hover:text-white disabled:opacity-50"
                >
                  {gallery.busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <ImagePlus className="h-4 w-4" aria-hidden />
                  )}
                  {gallery.busy ? 'Оруулж байна…' : 'Зураг оруулах'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={e => {
                    if (e.target.files?.length) gallery.addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
            {gallery.error && (
              <p className="mb-3 text-xs text-[#b91c1c]" role="alert">
                {gallery.error}
              </p>
            )}
            {!gallery.isCustom && (
              <p className="mb-3 text-xs text-[#111]/55">
                Одоогоор анхны зургууд харагдаж байна. Өөрийн зургийг оруулбал тэдгээрийг орлоно.
              </p>
            )}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {galleryImages.map((img, i) => (
                <li key={img.id} className="relative aspect-16/10 overflow-hidden bg-[#111]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${img.url})` }}
                  />
                  {gallery.isCustom && (
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#111]/75 px-1.5 py-1 text-white">
                      <button
                        type="button"
                        aria-label="Урагш"
                        disabled={i === 0}
                        onClick={() => gallery.move(img.id, -1)}
                        className="p-1 disabled:opacity-30"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Устгах"
                        onClick={() => gallery.remove(img.id)}
                        className="p-1 hover:text-[#ff6b6b]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Хойш"
                        disabled={i === galleryImages.length - 1}
                        onClick={() => gallery.move(img.id, 1)}
                        className="p-1 disabled:opacity-30"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
