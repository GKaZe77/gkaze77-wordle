// components/keyboard.js

const keysLayout = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','←']
];


export function renderKeyboard(onKeyPress) {
  const keyboard = document.getElementById('keyboard');
  if (!keyboard) return;
  keyboard.innerHTML = '';

  keysLayout.forEach(rowStr => {
    const row = document.createElement('div');
    row.className = 'keyboard-row';

    rowStr.split('').forEach(char => {
      const key = document.createElement('button');
      key.className = 'keyboard-key';
      key.textContent = char === '←' ? '⌫' : char;
      key.setAttribute('data-key', char === '←' ? '⌫' : char);

      key.addEventListener('click', () => {
        onKeyPress(char === '←' ? '⌫' : char);
      });

      row.appendChild(key);
    });

    keyboard.appendChild(row);
  });
}

export function updateKeyColors(feedback, guess) {
  const keys = document.querySelectorAll('.keyboard-key');
  const map = {};

  feedback.forEach((f, i) => {
    const letter = guess[i];
    if (f === '🟩') map[letter] = 'key-green';
    else if (f === '🟨' && map[letter] !== 'key-green') map[letter] = 'key-yellow';
    else if (f === '⬜️' && !map[letter]) map[letter] = 'key-gray';
  });

  keys.forEach(k => {
    const char = k.getAttribute('data-key');
    if (!map[char]) return;

    k.classList.remove('key-green', 'key-yellow', 'key-gray');
    k.classList.add(map[char]);
  });
}
