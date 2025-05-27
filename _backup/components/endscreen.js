// components/endscreen.js
// Displays the final message + replay/menu buttons

let cleanupCallback = null;

/**
 * Renders the end screen and binds replay/menu logic
 * @param {boolean} isWin - Whether the user won
 * @param {string} answer - The correct word
 * @param {Function} onRestart - Callback to run if "Play Again" clicked
 */
export function renderEndScreen(isWin, answer, onRestart) {
  cleanupEndScreen(); // clear prior content

  const container = document.getElementById('endscreen');
  if (!container) return;

  cleanupCallback = onRestart;

  container.innerHTML = `
    <div class="end-message">
      <h2>${isWin ? 'You Win!' : 'Game Over'}</h2>
      <p>The word was: <strong>${answer}</strong></p>
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

/**
 * Clears endscreen DOM and resets callback
 */
export function cleanupEndScreen() {
  const container = document.getElementById('endscreen');
  if (container) container.innerHTML = '';
  cleanupCallback = null;
}
