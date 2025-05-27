const KEYS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  ['ENTER', ...'ZXCVBNM'.split(''), '⌫']
];

let onKey = null;
const keyStates = {}; // e.g. A → 'correct' | 'present' | 'absent'

/**
 * Renders the keyboard and binds keys to the current onKeyPress handler
 * @param {Function} onKeyPress 
 */
export function renderKeyboard(onKeyPress) {
  onKey = onKeyPress;
  const container = document.getElementById('keyboard');
  container.innerHTML = '';

  KEYS.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';

    row.forEach(key => {
      const btn = document.createElement('button');
      btn.textContent = key;
      btn.className = `key ${getKeyClass(key)}`;
      btn.setAttribute('data-key', key);
      btn.onclick = () => onKey(key);
      rowDiv.appendChild(btn);
    });

    container.appendChild(rowDiv);
  });
}

/**
 * Updates key color states after each guess
 * @param {string[]} feedback - Emoji tiles per letter
 * @param {string} guess - 5-letter guess word
 */
export function updateKeyColors(feedback, guess) {
  for (let i = 0; i < 5; i++) {
    const letter = guess[i].toUpperCase();
    const symbol = feedback[i];
    const current = keyStates[letter];

    if (!letter.match(/[A-Z]/)) continue;

    if (symbol === '🟩') {
      keyStates[letter] = 'correct';
    } else if (symbol === '🟨' && current !== 'correct') {
      keyStates[letter] = 'present';
    } else if (symbol === '⬜️' && !current) {
      keyStates[letter] = 'absent';
    }
  }

  renderKeyboard(onKey); // force re-render with updated states
}

/**
 * Returns appropriate class based on the letter state
 * @param {string} key 
 * @returns {string}
 */
function getKeyClass(key) {
  const state = keyStates[key];
  if (state === 'correct') return 'key-correct';
  if (state === 'present') return 'key-present';
  if (state === 'absent') return 'key-absent';
  return 'key-unused';
}
