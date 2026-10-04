'use client';

/**
 * Firebase-Storage-like helpers on top of Supabase Storage.
 * All files live in the public `user-files` bucket (see supabase/migrations).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export const STORAGE_BUCKET = 'user-files';

export class Storage {
  constructor(public readonly client: SupabaseClient) {}
}

export interface StorageReference {
  storage: Storage;
  fullPath: string;
}

/** Supabase object keys only accept a limited character set. */
function sanitizeKey(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map(part => part.replace(/[^A-Za-z0-9._\-() ]/g, '_').replace(/ /g, '_'))
    .join('/');
}

export function ref(storage: Storage, path: string): StorageReference {
  return { storage, fullPath: sanitizeKey(path) };
}

export async function uploadBytes(
  storageRef: StorageReference,
  data: Blob | File | ArrayBuffer,
  metadata?: { contentType?: string }
): Promise<void> {
  const contentType =
    metadata?.contentType ?? (data instanceof Blob ? data.type || undefined : undefined);
  const { error } = await storageRef.storage.client.storage
    .from(STORAGE_BUCKET)
    .upload(storageRef.fullPath, data, { upsert: true, contentType });
  if (error) throw error;
}

export async function getDownloadURL(storageRef: StorageReference): Promise<string> {
  const { data } = storageRef.storage.client.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storageRef.fullPath);
  return data.publicUrl;
}
