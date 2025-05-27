// utils/dom.js
export function $(selector) {
  return document.querySelector(selector);
}

export function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

export function createEl(tag, className = '', text = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}
