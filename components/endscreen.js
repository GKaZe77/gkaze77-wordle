let cleanupCallback = null;

/**
 * Renders the end screen and binds replay/menu logic
 * @param {boolean} isWin - Whether the user won
 * @param {string} answer - The correct word
 * @param {Function} onRestart - Callback to run if "Play Again" clicked
 */
export function renderEndScreen(isWin, answer, onRestart) {
  cleanupEndScreen();

  const container = document.getElementById('endscreen');
  if (!container) return;

  cleanupCallback = onRestart;

  fetch(`https://api.gkaze77.com/wordle/definition?word=${answer}`)
    .then(res => res.ok ? res.json() : null)
    .then(json => {
      const def = json?.definition;
      const pos = json?.partOfSpeech;
      const defHTML = def
        ? `<p class="word-definition"><em>${pos}</em>: ${def}</p>`
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
    })
    .catch(() => {
      container.innerHTML = `
        <div class="end-message">
          <h2>${isWin ? 'You Win!' : 'Game Over'}</h2>
          <p>The word was: <strong>${answer}</strong></p>
          <p class="word-definition"><em>No definition found.</em></p>
          <div class="end-buttons">
            <button id="btn-back-menu">Back to Menu</button>
            <button id="btn-play-again">Play Again</button>
          </div>
        </div>
      `;
    })
    .finally(() => {
      document.getElementById('btn-back-menu')?.addEventListener('click', () => {
        window.location.href = '../index.html';
      });
      document.getElementById('btn-play-again')?.addEventListener('click', () => {
        if (typeof cleanupCallback === 'function') {
          cleanupCallback();
        }
      });
    });
}

/**
 * Clears endscreen DOM and resets callback
 */
export function cleanupEndScreen() {
  const container = document.getElementById('endscreen');
  if (container) container.innerHTML = '';
  cleanupCallback = null;
}
