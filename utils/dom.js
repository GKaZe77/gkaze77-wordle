// utils/dom.js

/**
 * Shorthand for querySelector.
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * Shorthand for querySelectorAll.
 */
export function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

/**
 * Create an element with class and optional text.
 */
export function createEl(tag, className = '', text = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}
