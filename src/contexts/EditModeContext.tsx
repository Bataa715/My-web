"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useFirebase } from '@/firebase';

interface EditModeContextType {
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { user, isUserLoading } = useFirebase();

  useEffect(() => {
    // Enable edit mode if user is logged in and loading is complete
    if (!isUserLoading) {
        setIsEditMode(!!user);
    }
  }, [user, isUserLoading]);

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
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
