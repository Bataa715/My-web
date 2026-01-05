'use client';

import { useState, useEffect } from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';

interface UseUserResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUser(auth: Auth | null): UseUserResult {
  const [userState, setUserState] = useState<UseUserResult>({
    user: null,
    isLoading: true, // Always start in loading state
    error: null,
  });

  useEffect(() => {
    // If no Auth service instance, we can't determine user state.
    // Set loading to false and return.
    if (!auth) {
      setUserState({
        user: null,
        isLoading: false,
        error: new Error('Auth service not provided.'),
      });
      return;
    }

    // Auth service is available, but we're still waiting for the onAuthStateChanged event.
    // Stay in the loading state.
    setUserState(prevState => ({ ...prevState, isLoading: true }));

    const unsubscribe = onAuthStateChanged(
      auth,
      firebaseUser => {
        // Auth state is now definitively determined.
        // Set the user and stop loading.
        setUserState({ user: firebaseUser, isLoading: false, error: null });
      },
      error => {
        // Auth listener encountered an error.
        console.error('useUser: onAuthStateChanged error:', error);
        setUserState({ user: null, isLoading: false, error: error });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Dependency on the auth instance

  return userState;
}
