// components/board.js

let wordDefinitions = null;

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

  if (!wordDefinitions) {
    fetch('../data/word_definitions.json')
      .then(res => res.json())
      .then(json => {
        wordDefinitions = json;
        renderBoard(maxGuesses, guesses, feedbacks, justFlippedRow); // re-render
      });
    return;
  }

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
        tile.classList.add(
          feedback[j] === '🟩' ? 'feedback-correct' :
          feedback[j] === '🟨' ? 'feedback-present' :
          feedback[j] === '⬜️' ? 'feedback-absent' : ''
        );
      }

      row.appendChild(tile);
    }

    const def = wordDefinitions[guess.toUpperCase()];
    if (isLockedIn && def) {
      row.classList.add('hover-word');
      row.setAttribute('data-word', guess.toUpperCase());
      row.setAttribute('data-definition', `${def.partOfSpeech.toUpperCase()}: ${def.definition}`);

      row.addEventListener('mouseenter', () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'word-tooltip';
        tooltip.textContent = row.dataset.definition;
        document.body.appendChild(tooltip);
        const rect = row.getBoundingClientRect();
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.left = `${rect.left}px`;
      });

      row.addEventListener('mouseleave', () => {
        document.querySelector('.word-tooltip')?.remove();
      });
    }

    container.appendChild(row);
  }
}
