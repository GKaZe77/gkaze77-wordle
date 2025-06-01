/**
 * Renders the full game board based on guess state.
 * @param {number} maxGuesses - Total rows to render
 * @param {string[]} guesses - Array of guessed words
 * @param {string[][]} feedbacks - Emoji feedback (🟩🟨⬜️) per row
 * @param {number|null} justFlippedRow - Row index to animate
 */
export function renderBoard(maxGuesses, guesses = [], feedbacks = [], justFlippedRow = null) {
  const container = document.getElementById('game-container');
  container.innerHTML = '';

  for (let i = 0; i < maxGuesses; i++) {
    const row = document.createElement('div');
    row.className = 'guess-row';

    const guess = guesses[i] || '';
    const feedback = feedbacks[i] || [];
    const isLockedIn = feedback.length === 5;

    for (let j = 0; j < 5; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.textContent = guess[j] || '';

      if (isLockedIn) {
        if (i === justFlippedRow) {
          tile.classList.add('flip');
          tile.style.animationDelay = `${j * 300}ms`;
        }

        if (feedback[j] === '🟩') tile.classList.add('feedback-correct');
        else if (feedback[j] === '🟨') tile.classList.add('feedback-present');
        else if (feedback[j] === '⬜️') tile.classList.add('feedback-absent');
      }

      row.appendChild(tile);
    }

    container.appendChild(row);
  }
}
