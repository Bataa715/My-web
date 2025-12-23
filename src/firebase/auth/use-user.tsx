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
    user: null, // Start with null user, let onAuthStateChanged determine the state
    isLoading: true, // Always start in loading state
    error: null,
  });

  useEffect(() => {
    // If no Auth service instance, we can't determine user state.
    // Set loading to false and return.
    if (!auth) {
      setUserState({ user: null, isLoading: false, error: new Error("Auth service not provided.") });
      return;
    }

    // Set initial state based on auth service's readiness, not currentUser
    setUserState({
        user: auth.currentUser,
        isLoading: !auth.currentUser, // Only stop loading if currentUser is already available
        error: null,
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Auth state is now definitively determined
        setUserState({ user: firebaseUser, isLoading: false, error: null });
      },
      (error) => {
        // Auth listener encountered an error
        console.error("useUser: onAuthStateChanged error:", error);
        setUserState({ user: null, isLoading: false, error: error });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Dependency on the auth instance

  return userState;
}
