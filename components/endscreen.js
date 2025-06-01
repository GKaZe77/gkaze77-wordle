// components/endscreen.js

let cleanupCallback = null;
let definitionData = null;

/**
 * Renders the end screen and binds replay/menu logic
 * @param {boolean} isWin
 * @param {string} answer
 * @param {Function} onRestart
 */
export function renderEndScreen(isWin, answer, onRestart) {
  cleanupEndScreen();

  const container = document.getElementById('endscreen');
  if (!container) return;

  cleanupCallback = onRestart;

  if (!definitionData) {
    fetch('../data/word_definitions.json')
      .then(res => res.json())
      .then(json => {
        definitionData = json;
        showEndScreen(container, isWin, answer);
      })
      .catch(() => {
        definitionData = {};
        showEndScreen(container, isWin, answer);
      });
  } else {
    showEndScreen(container, isWin, answer);
  }
}

function showEndScreen(container, isWin, answer) {
  const def = definitionData?.[answer.toUpperCase()];
  const defHTML = def
    ? `<p class="word-definition"><em>${def.partOfSpeech}</em>: ${def.definition}</p>`
    : `<p class="word-definition"><em>No definition available.</em></p>`;

  container.innerHTML = `
    <div class="end-message">
      <h2>${isWin ? 'You Win!' : 'Game Over'}</h2>
      <p>The word was: <strong>${answer}</strong></p>
      ${defHTML}
      <div class="end-buttons">
        <button id="btn-back-menu">Back to Menu</button>
        <button id="btn-play-again">Play Again</button>
      </div>
    </div>
  `;

  document.getElementById('btn-back-menu')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  document.getElementById('btn-play-again')?.addEventListener('click', () => {
    if (typeof cleanupCallback === 'function') {
      cleanupCallback();
    }
  });
}

export function cleanupEndScreen() {
  const container = document.getElementById('endscreen');
  if (container) container.innerHTML = '';
  cleanupCallback = null;
}
