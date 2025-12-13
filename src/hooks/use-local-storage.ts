"use client";

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// This hook is designed to run on the client side only.
// It synchronizes state with localStorage, but defers reading
// from localStorage until the component has mounted to avoid
// hydration mismatches between server and client.
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);

  // Effect to read from localStorage on mount
  useEffect(() => {
    let currentValue: T;
    try {
      const item = window.localStorage.getItem(key);
      currentValue = item ? JSON.parse(item) : initialValue;
    } catch (error) {
      currentValue = initialValue;
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
    setValue(currentValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to write to localStorage whenever the value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
