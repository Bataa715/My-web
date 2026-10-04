'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSupabase } from '@/supabase';
import { doc, getDoc, setDoc } from '@/supabase/db';
import { ref, uploadBytes, getDownloadURL, deleteObject } from '@/supabase/storage';
import { AOT_IMAGES } from '@/lib/aot-images';

export interface GalleryImage {
  id: string;
  url: string;
  /** Storage path for uploaded images (absent for the built-in defaults) */
  path?: string;
}

const DEFAULT_IMAGES: GalleryImage[] = [
  AOT_IMAGES.portal,
  AOT_IMAGES.sky,
  AOT_IMAGES.walls,
  AOT_IMAGES.flowers,
  AOT_IMAGES.meadow,
  AOT_IMAGES.pair,
  AOT_IMAGES.end,
  AOT_IMAGES.home,
].map((url, i) => ({ id: `default-${i}`, url }));

const MAX_EDGE = 2000;

/** Downscale to MAX_EDGE and re-encode as JPEG so uploads stay light. */
async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Encode failed'))), 'image/jpeg', 0.86)
  );
}

/**
 * Home-page gallery images: the owner can upload, reorder and remove them from
 * edit mode. Saved per account; the built-in pictures show until the owner
 * uploads their own.
 */
export function useGallery() {
  const { firestore, storage, user } = useSupabase();
  const [saved, setSaved] = useState<GalleryImage[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(firestore, `users/${user.uid}/settings/gallery`));
        if (!cancelled && snap.exists()) {
          const data = snap.data() as { images?: GalleryImage[] };
          if (Array.isArray(data.images)) setSaved(data.images);
        }
      } catch (e) {
        console.error('Error loading gallery:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firestore, user]);

  const images = saved && saved.length > 0 ? saved : DEFAULT_IMAGES;
  const isCustom = !!saved && saved.length > 0;

  const persist = useCallback(
    async (next: GalleryImage[]) => {
      setSaved(next);
      if (!firestore || !user) return;
      await setDoc(doc(firestore, `users/${user.uid}/settings/gallery`), { images: next });
    },
    [firestore, user]
  );

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!storage || !user) {
        setError('Зураг оруулахын тулд нэвтэрнэ үү.');
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const added: GalleryImage[] = [];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/')) continue;
          const blob = await prepareImage(file);
          const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const path = `users/${user.uid}/gallery/${id}.jpg`;
          await uploadBytes(ref(storage, path), blob, { contentType: 'image/jpeg' });
          added.push({ id, url: await getDownloadURL(ref(storage, path)), path });
        }
        // First upload replaces the built-in set; later uploads append
        await persist([...(isCustom ? images : []), ...added]);
      } catch (e) {
        console.error('Gallery upload failed:', e);
        setError('Зураг оруулахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setBusy(false);
      }
    },
    [storage, user, persist, images, isCustom]
  );

  const remove = useCallback(
    async (id: string) => {
      const target = images.find(i => i.id === id);
      try {
        await persist(images.filter(i => i.id !== id));
        if (target?.path && storage) await deleteObject(ref(storage, target.path));
      } catch (e) {
        console.error('Gallery remove failed:', e);
        setError('Зургийг устгахад алдаа гарлаа.');
      }
    },
    [images, persist, storage]
  );

  const move = useCallback(
    async (id: string, dir: -1 | 1) => {
      const i = images.findIndex(x => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= images.length) return;
      const next = [...images];
      [next[i], next[j]] = [next[j], next[i]];
      try {
        await persist(next);
      } catch (e) {
        console.error('Gallery reorder failed:', e);
      }
    },
    [images, persist]
  );

  const resetToDefault = useCallback(async () => {
    try {
      const paths = images.map(i => i.path).filter((x): x is string => !!x);
      await persist([]);
      if (storage) await Promise.allSettled(paths.map(pa => deleteObject(ref(storage, pa))));
    } catch (e) {
      console.error('Gallery reset failed:', e);
    }
  }, [persist, images, storage]);

  return { images, isCustom, busy, error, addFiles, remove, move, resetToDefault };
}
