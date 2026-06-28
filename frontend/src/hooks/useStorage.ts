import { useState } from 'react';

type StorageType = 'localStorage' | 'sessionStorage';

export function useStorage<T>(key: string, initialValue: T | (() => T), storageType: StorageType = 'localStorage'): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const getStorage = () => typeof window !== 'undefined' ? window[storageType] : null;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const storage = getStorage();
      const resolvedInitialValue = initialValue instanceof Function ? initialValue() : initialValue;
      if (!storage) return resolvedInitialValue;
      
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : resolvedInitialValue;
    } catch (error) {
      console.warn(`Error reading ${storageType} key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      const storage = getStorage();
      if (storage) {
        storage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting ${storageType} key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      const resolvedInitialValue = initialValue instanceof Function ? initialValue() : initialValue;
      setStoredValue(resolvedInitialValue);
      const storage = getStorage();
      if (storage) {
        storage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing ${storageType} key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  return useStorage(key, initialValue, 'localStorage');
}

export function useSessionStorage<T>(key: string, initialValue: T | (() => T)) {
  return useStorage(key, initialValue, 'sessionStorage');
}
