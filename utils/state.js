// utils/state.js
let state = {};

/**
 * Get the current global state.
 */
export function getState() {
  return state;
}

/**
 * Merge a new object into the global state.
 * @param {object} partial
 */
export function setState(partial) {
  state = { ...state, ...partial };
}
