'use client';

import { useState, useEffect } from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';

interface UseUserResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUser(auth: Auth): UseUserResult {
  const [userState, setUserState] = useState<UseUserResult>({
    user: auth ? auth.currentUser : null,
    isLoading: auth ? !auth.currentUser : true, 
    error: null,
  });

  useEffect(() => {
    // If no Auth service instance, cannot determine user state
    if (!auth) {
      setUserState({ user: null, isLoading: false, error: new Error("Auth service not provided.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Auth state determined
        setUserState({ user: firebaseUser, isLoading: false, error: null });
      },
      (error) => {
        // Auth listener error
        console.error("useUser: onAuthStateChanged error:", error);
        setUserState({ user: null, isLoading: false, error: error });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return userState;
}
