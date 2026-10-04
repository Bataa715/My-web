'use client';

/**
 * useSyncedState — state that survives reloads, redeploys and device changes.
 *
 *  1. Paints instantly from localStorage (per-browser cache).
 *  2. Once the user is known, loads the value from Supabase
 *     (`users/<uid>/appState/<key>`) and uses it as the source of truth.
 *  3. If nothing is stored remotely yet, the local value is uploaded once, so
 *     progress that only lived in this browser is migrated automatically.
 *  4. Every change is written to localStorage immediately and to Supabase
 *     (debounced). Failed saves surface through the global write-error toast.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSupabase } from '@/supabase';
import { doc, getDoc, setDoc } from '@/supabase/db';

const SAVE_DELAY_MS = 500;

function safeKey(key: string): string {
  return key.replace(/[^A-Za-z0-9_-]/g, '_');
}

function readLocal<T>(key: string): { found: boolean; value?: T } {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return { found: false };
    return { found: true, value: JSON.parse(raw) as T };
  } catch {
    return { found: false };
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / private mode — Supabase copy still works */
  }
}

export function useSyncedState<T>(
  key: string,
  initial: T
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const { firestore, user } = useSupabase();
  const uid = user?.uid;
  const docId = safeKey(key);

  const [value, setValueState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  const valueRef = useRef<T>(initial);
  const dirtyRef = useRef(false); // changed by the user before remote data arrived
  const hasLocalRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const ctxRef = useRef({ firestore, uid, docId });
  ctxRef.current = { firestore, uid, docId };

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!pendingRef.current) return;
    const { firestore: fs, uid: u, docId: id } = ctxRef.current;
    if (!fs || !u) return;
    pendingRef.current = false;
    try {
      await setDoc(doc(fs, `users/${u}/appState`, id), { value: valueRef.current });
    } catch {
      pendingRef.current = true; // retry on the next change / flush
    }
  }, []);

  // Reset + instant local paint whenever the key changes.
  useEffect(() => {
    const local = readLocal<T>(key);
    hasLocalRef.current = local.found;
    dirtyRef.current = false;
    pendingRef.current = false;
    const next = local.found ? (local.value as T) : initial;
    valueRef.current = next;
    setValueState(next);
    setLoaded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Remote load (source of truth) once the user + client are ready.
  useEffect(() => {
    if (!firestore || !uid) return;
    let cancelled = false;
    (async () => {
      try {
        const ref = doc(firestore, `users/${uid}/appState`, docId);
        const snap = await getDoc(ref);
        if (cancelled) return;
        if (snap.exists() && !dirtyRef.current) {
          const remote = (snap.data() as { value: T }).value;
          valueRef.current = remote;
          setValueState(remote);
          writeLocal(key, remote);
        } else if (hasLocalRef.current || dirtyRef.current) {
          // Nothing saved remotely yet (or the user already changed it):
          // upload what this browser has.
          await setDoc(ref, { value: valueRef.current });
        }
      } catch (e) {
        console.warn(`[useSyncedState] load failed for "${key}"`, e);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firestore, uid, docId, key]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === 'function' ? (next as (p: T) => T)(valueRef.current) : next;
      valueRef.current = resolved;
      dirtyRef.current = true;
      hasLocalRef.current = true;
      setValueState(resolved);
      writeLocal(key, resolved);
      pendingRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, SAVE_DELAY_MS);
    },
    [key, flush]
  );

  // Don't lose the last change when leaving the page / tab.
  useEffect(() => {
    const onHide = () => {
      void flush();
    };
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onHide);
      void flush();
    };
  }, [flush]);

  return [value, setValue, loaded];
}
