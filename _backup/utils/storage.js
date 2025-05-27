// utils/storage.js

const STORAGE_KEY = 'wordle-history';

export function saveResult(mode, result) {
  const existing = loadResults();
  existing.push({ mode, result, time: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function clearResults() {
  localStorage.removeItem(STORAGE_KEY);
}
