'use client';

import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { WRITE_ERROR_EVENT, type FirestoreError } from './db';

/**
 * Shows a toast whenever saving to Supabase fails, so progress is never lost
 * silently (e.g. missing table, expired session, no network).
 */
export default function WriteErrorNotifier() {
  useEffect(() => {
    let last = 0;
    const onError = (e: Event) => {
      const err = (e as CustomEvent<FirestoreError>).detail;
      const now = Date.now();
      if (now - last < 4000) return; // avoid toast spam on batch failures
      last = now;

      const code = err?.code ?? '';
      let description = 'Өөрчлөлт хадгалагдсангүй. Дахин оролдоно уу.';
      if (code === 'permission-denied' || code === 'unauthenticated') {
        description = 'Нэвтрээгүй эсвэл эрхгүй байна. Дахин нэвтэрч орно уу.';
      } else if (code === 'PGRST205' || code === '42P01') {
        description =
          'Өгөгдлийн сангийн хүснэгт үүсээгүй байна (supabase/migrations/0001_init.sql-ийг ажиллуулна уу).';
      } else if (/fetch|network/i.test(err?.message ?? '')) {
        description = 'Интернэт холболтоо шалгана уу.';
      }
      toast({
        title: 'Хадгалахад алдаа гарлаа',
        description,
        variant: 'destructive',
      });
    };
    window.addEventListener(WRITE_ERROR_EVENT, onError);
    return () => window.removeEventListener(WRITE_ERROR_EVENT, onError);
  }, []);

  return null;
}
