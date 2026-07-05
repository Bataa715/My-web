'use client';

/**
 * CosmosBackground — persistent 3D space backdrop for the whole site.
 *
 * Render strategy (fast first paint):
 *  1. A pure-CSS starfield fallback is server-rendered instantly — zero JS.
 *  2. After hydration, the Three.js engine chunk is imported dynamically
 *     (only if WebGL is available and the user allows motion).
 *  3. The canvas cross-fades in over the fallback once the first frame
 *     is ready, so there is never a black flash or layout shift.
 *
 * Route awareness: on "/" the camera flies a scroll-driven journey;
 * on every other page it settles into a calm ambient drift.
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { CosmosEngine } from './cosmos-engine';

function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function CosmosBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CosmosEngine | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  // Boot the engine once, after mount.
  useEffect(() => {
    let cancelled = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !webglSupported()) return; // CSS fallback stays forever

    (async () => {
      const { CosmosEngine, detectQuality } = await import('./cosmos-engine');
      if (cancelled || !canvasRef.current) return;
      engineRef.current = new CosmosEngine(canvasRef.current, detectQuality());
      // Give the engine two frames to render before revealing the canvas.
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && setReady(true)));
    })();

    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  // Route → camera mode.
  useEffect(() => {
    engineRef.current?.setMode(pathname === '/' ? 'journey' : 'ambient');
  }, [pathname, ready]);

  return (
    <div aria-hidden className="cosmos-bg">
      {/* CSS fallback: gradient nebula + three repeating star layers */}
      <div className={`cosmos-fallback${ready ? ' cosmos-fallback--hidden' : ''}`}>
        <div className="cosmos-fallback__stars cosmos-fallback__stars--1" />
        <div className="cosmos-fallback__stars cosmos-fallback__stars--2" />
        <div className="cosmos-fallback__stars cosmos-fallback__stars--3" />
      </div>
      <canvas
        ref={canvasRef}
        className={`cosmos-canvas${ready ? ' cosmos-canvas--ready' : ''}`}
      />
    </div>
  );
}
