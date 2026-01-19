/**
 * AsyncStorage adapter using MMKV
 *
 * Provides AsyncStorage-compatible interface for libraries that require it (like Mixpanel)
 * while using MMKV as the underlying storage implementation.
 */

import { createMMKV } from 'react-native-mmkv';

// Create a dedicated MMKV instance for AsyncStorage adapter
const storage = createMMKV({
  id: 'mixpanel-storage-adapter',
});

/**
 * AsyncStorage-compatible adapter using MMKV
 */
const MixPanelStorageAdapter = {
  /**
   * Set a string value for a key
   */
  setItem: async (key: string, value: string): Promise<void> => {
    storage.set(key, value);
  },

  /**
   * Get a string value for a key
   */
  getItem: async (key: string): Promise<string | null> => {
    const value = storage.getString(key);
    return value ?? null;
  },

  /**
   * Remove a key from storage
   */
  removeItem: async (key: string): Promise<void> => {
    storage.remove(key);
  },

  /**
   * Get all keys
   */
  getAllKeys: async (): Promise<string[]> => {
    return storage.getAllKeys();
  },

  /**
   * Clear all data
   */
  clear: async (): Promise<void> => {
    storage.clearAll();
  },

  /**
   * Merge a value with existing value (JSON merge)
   */
  mergeItem: async (key: string, value: string): Promise<void> => {
    const existingValue = storage.getString(key);
    if (existingValue) {
      try {
        const existing = JSON.parse(existingValue);
        const newValue = JSON.parse(value);
        const merged = { ...existing, ...newValue };
        storage.set(key, JSON.stringify(merged));
      } catch {
        // If parsing fails, just set the new value
        storage.set(key, value);
      }
    } else {
      storage.set(key, value);
    }
  },

  /**
   * Get multiple items at once
   */
  multiGet: async (keys: string[]): Promise<[string, string | null][]> => {
    return keys.map((key) => {
      const value = storage.getString(key);
      return [key, value ?? null];
    });
  },

  /**
   * Set multiple items at once
   */
  multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
    keyValuePairs.forEach(([key, value]) => {
      storage.set(key, value);
    });
  },

  /**
   * Remove multiple items at once
   */
  multiRemove: async (keys: string[]): Promise<void> => {
    keys.forEach((key) => {
      storage.remove(key);
    });
  },

  /**
   * Merge multiple items at once
   */
  multiMerge: async (keyValuePairs: [string, string][]): Promise<void> => {
    for (const [key, value] of keyValuePairs) {
      await MixPanelStorageAdapter.mergeItem(key, value);
    }
  },
};

export default MixPanelStorageAdapter;
