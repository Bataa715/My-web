'use client';

/**
 * Firestore-style document API on top of Supabase (Postgres).
 *
 * Every document lives in the `public.documents` table:
 *   path   text  primary key   e.g. "users/<uid>/skills/<id>"
 *   parent text                e.g. "users/<uid>/skills"
 *   data   jsonb               the document body
 *
 * Nested "collections" are therefore just rows that share the same `parent`.
 * Row level security (see supabase/migrations) restricts each user to the
 * paths below `users/<their auth uid>/`.
 *
 * Filtering / ordering / limits are applied on the client after fetching a
 * collection, which keeps Firestore semantics for this small personal dataset.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const TABLE = 'documents';
const PAGE_SIZE = 1000;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class FirestoreError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'FirestoreError';
    this.code = code;
  }
}

function toError(error: { code?: string; message: string }): FirestoreError {
  const code =
    error.code === '42501'
      ? 'permission-denied'
      : error.code === 'PGRST301' || error.code === 'PGRST303'
        ? 'unauthenticated'
        : error.code || 'unknown';
  return new FirestoreError(code, error.message);
}

export const WRITE_ERROR_EVENT = 'supabase-write-error';

/** Same as toError, but also tells the UI so failed saves are never silent. */
function writeError(error: { code?: string; message: string }): FirestoreError {
  const err = toError(error);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WRITE_ERROR_EVENT, { detail: err }));
  }
  return err;
}

// ---------------------------------------------------------------------------
// Timestamp / FieldValue
// ---------------------------------------------------------------------------

export class Timestamp {
  constructor(
    public readonly seconds: number,
    public readonly nanoseconds: number
  ) {}

  static now(): Timestamp {
    return Timestamp.fromMillis(Date.now());
  }

  static fromDate(date: Date): Timestamp {
    return Timestamp.fromMillis(date.getTime());
  }

  static fromMillis(ms: number): Timestamp {
    const seconds = Math.floor(ms / 1000);
    const nanoseconds = Math.floor((ms - seconds * 1000) * 1e6);
    return new Timestamp(seconds, nanoseconds);
  }

  toDate(): Date {
    return new Date(this.toMillis());
  }

  toMillis(): number {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6);
  }

  isEqual(other: Timestamp): boolean {
    return this.seconds === other.seconds && this.nanoseconds === other.nanoseconds;
  }

  valueOf(): string {
    return String(this.toMillis());
  }
}

class ServerTimestampSentinel {
  readonly _methodName = 'serverTimestamp';
}

export type FieldValue = ServerTimestampSentinel;

/** Marker replaced by the current time when the document is written. */
export function serverTimestamp(): FieldValue {
  return new ServerTimestampSentinel();
}

const TS_KEY = '__ts';

function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** App value -> JSON stored in Postgres. */
function encode(value: any): any {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value instanceof ServerTimestampSentinel) {
    return { [TS_KEY]: new Date().toISOString() };
  }
  if (value instanceof Timestamp) {
    return { [TS_KEY]: value.toDate().toISOString() };
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : { [TS_KEY]: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return value.map(v => {
      const e = encode(v);
      return e === undefined ? null : e;
    });
  }
  if (isPlainObject(value)) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      const e = encode(v);
      if (e !== undefined) out[k] = e;
    }
    return out;
  }
  return value;
}

/** JSON stored in Postgres -> app value (Timestamp instances restored). */
function decode(value: any): any {
  if (Array.isArray(value)) return value.map(decode);
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === TS_KEY && typeof value[TS_KEY] === 'string') {
      const d = new Date(value[TS_KEY]);
      if (!Number.isNaN(d.getTime())) return Timestamp.fromDate(d);
    }
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) out[k] = decode(v);
    return out;
  }
  return value;
}

function deepMerge(target: any, source: any): any {
  if (!isPlainObject(target) || !isPlainObject(source)) return source;
  const out: Record<string, any> = { ...target };
  for (const [k, v] of Object.entries(source)) {
    out[k] = isPlainObject(v) && isPlainObject(out[k]) ? deepMerge(out[k], v) : v;
  }
  return out;
}

/** Applies Firestore-style updates (supports "a.b.c" dotted field paths). */
function applyUpdate(current: Record<string, any>, updates: Record<string, any>) {
  const result: Record<string, any> = { ...current };
  for (const [key, rawValue] of Object.entries(updates)) {
    const value = encode(rawValue);
    if (value === undefined) continue;
    if (!key.includes('.')) {
      result[key] = value;
      continue;
    }
    const parts = key.split('.');
    let node = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const next = node[parts[i]];
      node[parts[i]] = isPlainObject(next) ? { ...next } : {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = value;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Firestore handle, references, snapshots
// ---------------------------------------------------------------------------

export class Firestore {
  constructor(public readonly client: SupabaseClient) {}
}

export type DocumentData = Record<string, any>;

function splitPath(...segments: string[]): string[] {
  return segments
    .join('/')
    .split('/')
    .map(s => s.trim())
    .filter(Boolean);
}

const AUTO_ID_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function autoId(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let id = '';
  for (const b of bytes) id += AUTO_ID_CHARS[b % AUTO_ID_CHARS.length];
  return id;
}

export class DocumentReference {
  readonly type = 'document' as const;
  constructor(
    public readonly firestore: Firestore,
    public readonly path: string
  ) {}

  get id(): string {
    return this.path.split('/').pop() as string;
  }

  get parent(): CollectionReference {
    return new CollectionReference(
      this.firestore,
      this.path.split('/').slice(0, -1).join('/')
    );
  }
}

type WhereOp =
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'in'
  | 'not-in'
  | 'array-contains'
  | 'array-contains-any';

interface WhereConstraint {
  type: 'where';
  field: string;
  op: WhereOp;
  value: any;
}
interface OrderByConstraint {
  type: 'orderBy';
  field: string;
  dir: 'asc' | 'desc';
}
interface LimitConstraint {
  type: 'limit';
  n: number;
}
export type QueryConstraint = WhereConstraint | OrderByConstraint | LimitConstraint;

export class Query {
  readonly type: 'query' | 'collection' = 'query';
  constructor(
    public readonly firestore: Firestore,
    public readonly path: string,
    public readonly constraints: QueryConstraint[] = []
  ) {}
}

export class CollectionReference extends Query {
  readonly type = 'collection' as any;
  constructor(firestore: Firestore, path: string) {
    super(firestore, path, []);
  }

  get id(): string {
    return this.path.split('/').pop() as string;
  }

  get parent(): DocumentReference | null {
    const parts = this.path.split('/');
    return parts.length > 1
      ? new DocumentReference(this.firestore, parts.slice(0, -1).join('/'))
      : null;
  }
}

export class DocumentSnapshot<T = DocumentData> {
  constructor(
    public readonly ref: DocumentReference,
    private readonly _data: T | undefined
  ) {}

  get id(): string {
    return this.ref.id;
  }

  exists(): this is QueryDocumentSnapshot<T> {
    return this._data !== undefined;
  }

  data(): T | undefined {
    return this._data;
  }

  get(field: string): any {
    return getField(this._data, field);
  }
}

export class QueryDocumentSnapshot<T = DocumentData> extends DocumentSnapshot<T> {
  data(): T {
    return super.data() as T;
  }
}

export class QuerySnapshot<T = DocumentData> {
  constructor(public readonly docs: QueryDocumentSnapshot<T>[]) {}

  get size(): number {
    return this.docs.length;
  }

  get empty(): boolean {
    return this.docs.length === 0;
  }

  forEach(callback: (doc: QueryDocumentSnapshot<T>) => void): void {
    this.docs.forEach(callback);
  }
}

/**
 * collection(firestore, 'users/uid/skills')
 * collection(firestore, 'users', uid, 'finances')
 * collection(docRef, 'subcollection')
 */
export function collection(
  parent: Firestore | DocumentReference,
  ...segments: string[]
): CollectionReference {
  const base = parent instanceof Firestore ? [] : [parent.path];
  const path = splitPath(...base, ...segments).join('/');
  const firestore = parent instanceof Firestore ? parent : parent.firestore;
  return new CollectionReference(firestore, path);
}

/**
 * doc(firestore, 'users/uid') | doc(firestore, 'users', uid)
 * doc(collectionRef) -> auto id | doc(collectionRef, id)
 */
export function doc(
  parent: Firestore | CollectionReference,
  ...segments: string[]
): DocumentReference {
  if (parent instanceof Firestore) {
    return new DocumentReference(parent, splitPath(...segments).join('/'));
  }
  const parts = splitPath(...segments);
  const id = parts.length ? parts.join('/') : autoId();
  return new DocumentReference(parent.firestore, `${parent.path}/${id}`);
}

export function where(field: string, op: WhereOp, value: any): QueryConstraint {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, dir: 'asc' | 'desc' = 'asc'): QueryConstraint {
  return { type: 'orderBy', field, dir };
}

export function limit(n: number): QueryConstraint {
  return { type: 'limit', n };
}

export function query(q: Query, ...constraints: QueryConstraint[]): Query {
  return new Query(q.firestore, q.path, [...q.constraints, ...constraints]);
}

// ---------------------------------------------------------------------------
// Query evaluation (client side)
// ---------------------------------------------------------------------------

function getField(data: any, field: string): any {
  let node = data;
  for (const part of field.split('.')) {
    if (node === null || node === undefined) return undefined;
    node = node[part];
  }
  return node;
}

function comparable(value: any): any {
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return value;
}

function compare(a: any, b: any): number {
  const x = comparable(a);
  const y = comparable(b);
  const xMissing = x === undefined || x === null;
  const yMissing = y === undefined || y === null;
  if (xMissing || yMissing) return xMissing === yMissing ? 0 : xMissing ? -1 : 1;
  if (typeof x === 'number' && typeof y === 'number') return x - y;
  if (typeof x === 'string' && typeof y === 'string') {
    return x < y ? -1 : x > y ? 1 : 0;
  }
  if (typeof x === 'boolean' && typeof y === 'boolean') return Number(x) - Number(y);
  return String(x) < String(y) ? -1 : String(x) > String(y) ? 1 : 0;
}

function matches(data: DocumentData, c: WhereConstraint): boolean {
  const actual = getField(data, c.field);
  switch (c.op) {
    case '==':
      return compare(actual, c.value) === 0 && actual !== undefined;
    case '!=':
      return actual !== undefined && compare(actual, c.value) !== 0;
    case '<':
      return actual != null && compare(actual, c.value) < 0;
    case '<=':
      return actual != null && compare(actual, c.value) <= 0;
    case '>':
      return actual != null && compare(actual, c.value) > 0;
    case '>=':
      return actual != null && compare(actual, c.value) >= 0;
    case 'in':
      return (
        actual !== undefined &&
        (c.value as any[]).some(v => compare(actual, v) === 0)
      );
    case 'not-in':
      return (
        actual !== undefined &&
        !(c.value as any[]).some(v => compare(actual, v) === 0)
      );
    case 'array-contains':
      return (
        Array.isArray(actual) && actual.some(v => compare(v, c.value) === 0)
      );
    case 'array-contains-any':
      return (
        Array.isArray(actual) &&
        actual.some(v => (c.value as any[]).some(w => compare(v, w) === 0))
      );
    default:
      return false;
  }
}

function applyConstraints(
  docs: QueryDocumentSnapshot[],
  constraints: QueryConstraint[]
): QueryDocumentSnapshot[] {
  let result = docs;
  for (const c of constraints) {
    if (c.type === 'where') {
      result = result.filter(d => matches(d.data(), c));
    }
  }
  const orders = constraints.filter(
    (c): c is OrderByConstraint => c.type === 'orderBy'
  );
  if (orders.length) {
    result = [...result].sort((a, b) => {
      for (const o of orders) {
        const diff = compare(getField(a.data(), o.field), getField(b.data(), o.field));
        if (diff !== 0) return o.dir === 'desc' ? -diff : diff;
      }
      return 0;
    });
  }
  const lim = constraints.filter((c): c is LimitConstraint => c.type === 'limit').pop();
  if (lim) result = result.slice(0, lim.n);
  return result;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Concurrent identical reads (e.g. header + footer both loading the profile
 * document on mount) share one network request. Cleared on every write so a
 * read started after a write never joins a stale request.
 */
const inflight = new Map<string, Promise<any>>();

function dedupe<R>(key: string, load: () => Promise<R>): Promise<R> {
  const existing = inflight.get(key);
  if (existing) return existing;
  const promise: Promise<R> = load().finally(() => {
    if (inflight.get(key) === promise) inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}

export async function getDoc<T = DocumentData>(
  ref: DocumentReference
): Promise<DocumentSnapshot<T>> {
  const raw = await dedupe(`doc:${ref.path}`, async () => {
    const { data, error } = await ref.firestore.client
      .from(TABLE)
      .select('data')
      .eq('path', ref.path)
      .maybeSingle();
    if (error) throw toError(error);
    return data ? (data.data as unknown) : undefined;
  });
  return new DocumentSnapshot<T>(
    ref,
    raw === undefined ? undefined : (decode(raw) as T)
  );
}

export async function getDocs<T = DocumentData>(
  q: Query
): Promise<QuerySnapshot<T>> {
  const rows = await dedupe(`col:${q.path}`, async () => {
    const out: { path: string; data: any }[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await q.firestore.client
        .from(TABLE)
        .select('path,data')
        .eq('parent', q.path)
        .order('created_at', { ascending: true })
        .order('path', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw toError(error);
      out.push(...(data ?? []));
      if (!data || data.length < PAGE_SIZE) break;
    }
    return out;
  });

  const docs = rows.map(
    row =>
      new QueryDocumentSnapshot(
        new DocumentReference(q.firestore, row.path),
        decode(row.data)
      )
  );
  return new QuerySnapshot<T>(applyConstraints(docs, q.constraints) as any);
}

// ---------------------------------------------------------------------------
// Realtime-ish listeners
// ---------------------------------------------------------------------------

const localListeners = new Map<string, Set<() => void>>();

function notifyParent(parent: string) {
  inflight.clear();
  localListeners.get(parent)?.forEach(fn => fn());
}

export function onSnapshot<T = DocumentData>(
  target: DocumentReference,
  onNext: (snap: DocumentSnapshot<T>) => void,
  onError?: (error: FirestoreError) => void
): () => void;
export function onSnapshot<T = DocumentData>(
  target: Query,
  onNext: (snap: QuerySnapshot<T>) => void,
  onError?: (error: FirestoreError) => void
): () => void;
export function onSnapshot(
  target: Query | DocumentReference,
  onNext: (snap: any) => void,
  onError?: (error: FirestoreError) => void
): () => void {
  const isDoc = target instanceof DocumentReference;
  const parent = isDoc
    ? target.path.split('/').slice(0, -1).join('/')
    : (target as Query).path;
  let active = true;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const run = async () => {
    try {
      const snap = isDoc
        ? await getDoc(target as DocumentReference)
        : await getDocs(target as Query);
      if (active) onNext(snap);
    } catch (e) {
      if (active) onError?.(e as FirestoreError);
    }
  };

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, 30);
  };

  void run();

  // Same-tab writes.
  let set = localListeners.get(parent);
  if (!set) {
    set = new Set();
    localListeners.set(parent, set);
  }
  set.add(schedule);

  // Re-read when the tab becomes visible again so changes made in another
  // tab / device show up (no realtime socket: login uses a custom header).
  const onVisible = () => {
    if (document.visibilityState === 'visible') schedule();
  };
  document.addEventListener('visibilitychange', onVisible);

  return () => {
    active = false;
    if (timer) clearTimeout(timer);
    localListeners.get(parent)?.delete(schedule);
    document.removeEventListener('visibilitychange', onVisible);
  };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

function parentOf(path: string): string {
  return path.split('/').slice(0, -1).join('/');
}

async function readRaw(ref: DocumentReference): Promise<Record<string, any> | undefined> {
  const { data, error } = await ref.firestore.client
    .from(TABLE)
    .select('data')
    .eq('path', ref.path)
    .maybeSingle();
  if (error) throw toError(error);
  return data ? data.data : undefined;
}

export async function setDoc(
  ref: DocumentReference,
  data: DocumentData,
  options?: { merge?: boolean }
): Promise<void> {
  let body = encode(data) as Record<string, any>;
  if (options?.merge) {
    const existing = await readRaw(ref);
    if (existing) body = deepMerge(existing, body);
  }
  const { error } = await ref.firestore.client
    .from(TABLE)
    .upsert({ path: ref.path, parent: parentOf(ref.path), data: body }, { onConflict: 'path' });
  if (error) throw writeError(error);
  notifyParent(parentOf(ref.path));
}

export async function addDoc(
  col: CollectionReference,
  data: DocumentData
): Promise<DocumentReference> {
  const ref = new DocumentReference(col.firestore, `${col.path}/${autoId()}`);
  const { error } = await col.firestore.client
    .from(TABLE)
    .insert({ path: ref.path, parent: col.path, data: encode(data) });
  if (error) throw writeError(error);
  notifyParent(col.path);
  return ref;
}

export async function updateDoc(
  ref: DocumentReference,
  data: DocumentData
): Promise<void> {
  // Unlike Firestore this creates the document when it does not exist yet
  // (e.g. the profile doc of a brand-new account) instead of failing, so
  // progress / settings are never silently lost.
  const existing = (await readRaw(ref)) ?? {};
  const { error } = await ref.firestore.client.from(TABLE).upsert(
    {
      path: ref.path,
      parent: parentOf(ref.path),
      data: applyUpdate(existing, data),
    },
    { onConflict: 'path' }
  );
  if (error) throw writeError(error);
  notifyParent(parentOf(ref.path));
}

export async function deleteDoc(ref: DocumentReference): Promise<void> {
  const { error } = await ref.firestore.client.from(TABLE).delete().eq('path', ref.path);
  if (error) throw writeError(error);
  notifyParent(parentOf(ref.path));
}

type BatchOp =
  | { kind: 'set'; ref: DocumentReference; data: DocumentData; merge: boolean }
  | { kind: 'update'; ref: DocumentReference; data: DocumentData }
  | { kind: 'delete'; ref: DocumentReference };

export class WriteBatch {
  private ops: BatchOp[] = [];
  constructor(private readonly firestore: Firestore) {}

  set(ref: DocumentReference, data: DocumentData, options?: { merge?: boolean }) {
    this.ops.push({ kind: 'set', ref, data, merge: !!options?.merge });
    return this;
  }

  update(ref: DocumentReference, data: DocumentData) {
    this.ops.push({ kind: 'update', ref, data });
    return this;
  }

  delete(ref: DocumentReference) {
    this.ops.push({ kind: 'delete', ref });
    return this;
  }

  async commit(): Promise<void> {
    const client = this.firestore.client;
    const touched = new Set<string>();
    const ops = this.ops;
    this.ops = [];

    // Consecutive operations of the same kind are sent to Postgres in one request.
    let i = 0;
    while (i < ops.length) {
      const kind = ops[i].kind;
      let j = i;
      while (j < ops.length && ops[j].kind === kind) j++;
      const group = ops.slice(i, j);
      i = j;

      if (kind === 'delete') {
        const paths = group.map(o => o.ref.path);
        const { error } = await client.from(TABLE).delete().in('path', paths);
        if (error) throw writeError(error);
        paths.forEach(p => touched.add(parentOf(p)));
      } else if (kind === 'set' && group.every(o => o.kind === 'set' && !o.merge)) {
        const rows = new Map<string, any>();
        for (const o of group) {
          if (o.kind !== 'set') continue;
          rows.set(o.ref.path, {
            path: o.ref.path,
            parent: parentOf(o.ref.path),
            data: encode(o.data),
          });
        }
        const { error } = await client
          .from(TABLE)
          .upsert([...rows.values()], { onConflict: 'path' });
        if (error) throw writeError(error);
        rows.forEach(r => touched.add(r.parent));
      } else {
        // update / merge-set: read existing bodies in one request, write back in one.
        const paths = [...new Set(group.map(o => o.ref.path))];
        const { data: existingRows, error: readError } = await client
          .from(TABLE)
          .select('path,data')
          .in('path', paths);
        if (readError) throw toError(readError);
        const current = new Map<string, Record<string, any> | undefined>(
          (existingRows ?? []).map((r: any) => [r.path, r.data])
        );
        for (const o of group) {
          const prev = current.get(o.ref.path);
          if (o.kind === 'update') {
            current.set(o.ref.path, applyUpdate(prev ?? {}, o.data));
          } else if (o.kind === 'set') {
            const body = encode(o.data);
            current.set(o.ref.path, prev && o.merge ? deepMerge(prev, body) : body);
          }
        }
        const rows = paths.map(p => ({
          path: p,
          parent: parentOf(p),
          data: current.get(p),
        }));
        const { error } = await client.from(TABLE).upsert(rows, { onConflict: 'path' });
        if (error) throw writeError(error);
        rows.forEach(r => touched.add(r.parent));
      }
    }

    touched.forEach(notifyParent);
  }
}

export function writeBatch(firestore: Firestore): WriteBatch {
  return new WriteBatch(firestore);
}
