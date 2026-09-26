import { test, expect } from '@playwright/test';

test('persistence: loadState returns null when storage is unavailable', async () => {
  // Unit project runs in Node: localStorage is undefined, the guard must
  // swallow the error and yield "no persistence" instead of crashing.
  const { loadState } = await import('../../persistence.js');
  expect(loadState()).toBeNull();
});
