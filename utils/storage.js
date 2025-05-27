// utils/storage.js

const STORAGE_KEY = 'wordle-history';

/**
 * Save a result with a mode tag.
 */
export function saveResult(mode, result) {
  const existing = loadResults();
  existing.push({ mode, result, time: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/**
 * Load all results from localStorage.
 */
export function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Clear all saved results.
 */
export function clearResults() {
  localStorage.removeItem(STORAGE_KEY);
}
