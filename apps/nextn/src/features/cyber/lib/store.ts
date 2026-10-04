'use client';

/**
 * Minimal zustand-compatible store — just enough of the `create` API that the
 * cyber-learning subsystem uses (ported from NetVerse). Avoids adding a
 * runtime dependency to this workspace.
 *
 * Supported surface:
 *   const useStore = create<T>((set, get) => ({ ...state, ...actions }))
 *   useStore()                 → whole state (re-renders on any change)
 *   useStore(s => s.slice)     → selected slice (re-renders on that change)
 *   useStore.getState()        → current state outside React
 *   useStore.setState(partial) → merge-update
 *   useStore.subscribe(fn)     → change listener (returns unsubscribe)
 *
 * Selectors MUST return stable values (primitives or existing refs); none of
 * the ported selectors build a fresh object per call, so useSyncExternalStore
 * stays loop-free.
 */
import { useSyncExternalStore } from 'react';

type Listener = () => void;
type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T> | void)) => void;
type GetState<T> = () => T;

export interface StoreApi<T> {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: Listener) => () => void;
}

export function create<T>(
  initializer: (set: SetState<T>, get: GetState<T>) => T
): StoreApi<T> {
  let state: T;
  const listeners = new Set<Listener>();

  const setState: SetState<T> = partial => {
    const next =
      typeof partial === 'function'
        ? (partial as (s: T) => Partial<T> | void)(state)
        : partial;
    if (next == null) return;
    state = Object.assign({}, state, next) as T;
    listeners.forEach(l => l());
  };

  const getState: GetState<T> = () => state;

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = initializer(setState, getState);

  const useStore = (<U>(selector?: (s: T) => U) => {
    const sel = (selector ?? ((s: T) => s as unknown as U)) as (s: T) => U;
    return useSyncExternalStore(
      subscribe,
      () => sel(state),
      () => sel(state)
    );
  }) as StoreApi<T>;

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;

  return useStore;
}
