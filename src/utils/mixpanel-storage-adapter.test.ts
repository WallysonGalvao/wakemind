// Mock MMKV
const mockStorage = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: jest.fn((key: string, value: string) => {
      mockStorage.set(key, value);
    }),
    getString: jest.fn((key: string) => {
      return mockStorage.get(key);
    }),
    remove: jest.fn((key: string) => {
      mockStorage.delete(key);
    }),
    getAllKeys: jest.fn(() => {
      return Array.from(mockStorage.keys());
    }),
    clearAll: jest.fn(() => {
      mockStorage.clear();
    }),
  })),
}));

import AsyncStorageAdapter from './mixpanel-storage-adapter';

describe('AsyncStorageAdapter', () => {
  beforeEach(async () => {
    mockStorage.clear();
    await AsyncStorageAdapter.clear();
  });

  afterEach(async () => {
    mockStorage.clear();
    await AsyncStorageAdapter.clear();
  });

  describe('Basic operations', () => {
    it('should set and get item', async () => {
      await AsyncStorageAdapter.setItem('test-key', 'test-value');
      const value = await AsyncStorageAdapter.getItem('test-key');
      expect(value).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      const value = await AsyncStorageAdapter.getItem('non-existent');
      expect(value).toBeNull();
    });

    it('should remove item', async () => {
      await AsyncStorageAdapter.setItem('test-key', 'test-value');
      await AsyncStorageAdapter.removeItem('test-key');
      const value = await AsyncStorageAdapter.getItem('test-key');
      expect(value).toBeNull();
    });

    it('should get all keys', async () => {
      await AsyncStorageAdapter.setItem('key1', 'value1');
      await AsyncStorageAdapter.setItem('key2', 'value2');
      await AsyncStorageAdapter.setItem('key3', 'value3');

      const keys = await AsyncStorageAdapter.getAllKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should clear all items', async () => {
      await AsyncStorageAdapter.setItem('key1', 'value1');
      await AsyncStorageAdapter.setItem('key2', 'value2');
      await AsyncStorageAdapter.clear();

      const value1 = await AsyncStorageAdapter.getItem('key1');
      const value2 = await AsyncStorageAdapter.getItem('key2');

      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });
  });

  describe('Multi operations', () => {
    it('should get multiple items', async () => {
      await AsyncStorageAdapter.setItem('key1', 'value1');
      await AsyncStorageAdapter.setItem('key2', 'value2');

      const items = await AsyncStorageAdapter.multiGet(['key1', 'key2', 'key3']);

      expect(items).toEqual([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', null],
      ]);
    });

    it('should set multiple items', async () => {
      await AsyncStorageAdapter.multiSet([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);

      const value1 = await AsyncStorageAdapter.getItem('key1');
      const value2 = await AsyncStorageAdapter.getItem('key2');

      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
    });

    it('should remove multiple items', async () => {
      await AsyncStorageAdapter.setItem('key1', 'value1');
      await AsyncStorageAdapter.setItem('key2', 'value2');
      await AsyncStorageAdapter.setItem('key3', 'value3');

      await AsyncStorageAdapter.multiRemove(['key1', 'key2']);

      const value1 = await AsyncStorageAdapter.getItem('key1');
      const value2 = await AsyncStorageAdapter.getItem('key2');
      const value3 = await AsyncStorageAdapter.getItem('key3');

      expect(value1).toBeNull();
      expect(value2).toBeNull();
      expect(value3).toBe('value3');
    });
  });

  describe('Merge operations', () => {
    it('should merge JSON objects', async () => {
      const initial = JSON.stringify({ name: 'John', age: 30 });
      const update = JSON.stringify({ age: 31, city: 'NYC' });

      await AsyncStorageAdapter.setItem('user', initial);
      await AsyncStorageAdapter.mergeItem('user', update);

      const result = await AsyncStorageAdapter.getItem('user');
      const parsed = JSON.parse(result!);

      expect(parsed).toEqual({
        name: 'John',
        age: 31,
        city: 'NYC',
      });
    });

    it('should set value if key does not exist on merge', async () => {
      const value = JSON.stringify({ name: 'John' });
      await AsyncStorageAdapter.mergeItem('new-key', value);

      const result = await AsyncStorageAdapter.getItem('new-key');
      expect(result).toBe(value);
    });

    it('should handle multi merge', async () => {
      await AsyncStorageAdapter.setItem('user1', JSON.stringify({ name: 'John', age: 30 }));
      await AsyncStorageAdapter.setItem('user2', JSON.stringify({ name: 'Jane', age: 25 }));

      await AsyncStorageAdapter.multiMerge([
        ['user1', JSON.stringify({ age: 31 })],
        ['user2', JSON.stringify({ city: 'LA' })],
      ]);

      const user1 = JSON.parse((await AsyncStorageAdapter.getItem('user1'))!);
      const user2 = JSON.parse((await AsyncStorageAdapter.getItem('user2'))!);

      expect(user1).toEqual({ name: 'John', age: 31 });
      expect(user2).toEqual({ name: 'Jane', age: 25, city: 'LA' });
    });
  });
});
