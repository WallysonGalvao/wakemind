// Polyfills for Jest
global.__DEV__ = true;
process.env.NODE_ENV = 'test';

// Disable expo winter by mocking the global registry
global.__ExpoImportMetaRegistry = {};

// Mock structuredClone if not available
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
