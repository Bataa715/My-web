'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

interface EditModeContextType {
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  /** Flip edit mode on/off (used by the floating toggle + Alt+E shortcut). */
  toggleEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'edit-mode';

export function EditModeProvider({ children }: { children: ReactNode }) {
  // Always start `false` so server + first client render match (no hydration
  // mismatch); the remembered value is applied right after mount.
  const [isEditMode, setIsEditModeState] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') setIsEditModeState(true);
    } catch {}
  }, []);

  // Mirror to <html data-edit-mode> so CSS can react (page frame, hints) and
  // remember the choice for this tab, so a refresh doesn't kick you out.
  useEffect(() => {
    document.documentElement.dataset.editMode = isEditMode ? 'true' : 'false';
    try {
      if (isEditMode) sessionStorage.setItem(STORAGE_KEY, '1');
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [isEditMode]);

  const setIsEditMode = useCallback(
    (value: boolean) => setIsEditModeState(value),
    []
  );
  const toggleEditMode = useCallback(
    () => setIsEditModeState(prev => !prev),
    []
  );

  const value = useMemo(
    () => ({ isEditMode, setIsEditMode, toggleEditMode }),
    [isEditMode, setIsEditMode, toggleEditMode]
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within a EditModeProvider');
  }
  return context;
}
