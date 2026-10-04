'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Pencil } from 'lucide-react';
import { useEditMode } from '@/providers/EditModeContext';
import { useSupabase } from '@/supabase';
import { cn } from '@/lib/utils';

/**
 * EditModeToggle — one always-visible button to switch the whole site between
 * "view" and "edit". Signed-in owners only.
 *
 *  • Tap/click the floating pencil → edit mode ON (pencils + "+" buttons appear
 *    everywhere, the page gets a thin glowing frame).
 *  • Tap it again ("Дуусгах") → back to the clean view.
 *  • Keyboard: Alt + E toggles from anywhere. Edit mode is remembered for the
 *    tab, and is switched off automatically when you sign out.
 */
export default function EditModeToggle() {
  const { isEditMode, setIsEditMode, toggleEditMode } = useEditMode();
  const { user, isUserLoading } = useSupabase();
  const canEdit = !!user && !isUserLoading;

  // Signed out → never stay in edit mode.
  useEffect(() => {
    if (!canEdit && !isUserLoading && isEditMode) setIsEditMode(false);
  }, [canEdit, isUserLoading, isEditMode, setIsEditMode]);

  // Alt + E shortcut.
  useEffect(() => {
    if (!canEdit) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyE') {
        e.preventDefault();
        toggleEditMode();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canEdit, toggleEditMode]);

  if (!canEdit) return null;

  return (
    <div className="fixed right-4 z-[9995] bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      <motion.button
        type="button"
        onClick={toggleEditMode}
        whileTap={{ scale: 0.94 }}
        aria-pressed={isEditMode}
        aria-label={isEditMode ? 'Засварыг дуусгах' : 'Засварлах горим асаах'}
        title={isEditMode ? 'Дуусгах (Alt+E)' : 'Засварлах (Alt+E)'}
        className={cn(
          'flex items-center gap-2 h-12 rounded-full border px-4 text-sm font-semibold',
          'shadow-xl transition-colors duration-300',
          isEditMode
            ? 'edit-fab--active bg-primary text-primary-foreground border-primary/60 shadow-primary/30'
            : 'bg-background/90 text-foreground border-border/60 hover:bg-background/90 hover:border-primary/50'
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isEditMode ? 'done' : 'edit'}
            initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ duration: 0.16 }}
            className="flex"
          >
            {isEditMode ? (
              <Check className="h-5 w-5" />
            ) : (
              <Pencil className="h-5 w-5" />
            )}
          </motion.span>
        </AnimatePresence>
        <span className="hidden sm:inline">
          {isEditMode ? 'Дуусгах' : 'Засах'}
        </span>
      </motion.button>
    </div>
  );
}
