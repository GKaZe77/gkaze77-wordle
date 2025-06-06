// components/board.js

/**
 * @param {number} maxRows - Maximum number of guesses allowed.
 * @param {string[]} guesses - Player's guesses so far.
 * @param {string[][]} feedbacks - Feedback symbols per guess (🟩, 🟨, ⬜️).
 * @param {number} highlightRow - Row index to apply fresh animations to.
 */
export function renderBoard(maxRows, guesses, feedbacks, highlightRow = -1) {
  const container = document.getElementById("game-container");
  container.innerHTML = "";

  for (let i = 0; i < maxRows; i++) {
    const row = document.createElement("div");
    row.className = "guess-row";

    const guess = guesses[i] || "";
    const fb = feedbacks[i] || [];

    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      const letter = guess[j] || "";
      tile.textContent = letter;

      if (fb[j]) {
        if (i === highlightRow) tile.classList.add("flip"); // ✅ flip only on current feedback row
        if (fb[j] === "🟩") tile.classList.add("feedback-correct");
        else if (fb[j] === "🟨") tile.classList.add("feedback-present");
        else if (fb[j] === "⬜️") tile.classList.add("feedback-absent");
      }

      row.appendChild(tile);
    }

    container.appendChild(row);
  }
}
