// utils/state.js
let state = {};

export function getState() {
  return state;
}

export function setState(partial) {
  state = { ...state, ...partial };
}
