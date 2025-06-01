// components/board.js

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
        tile.classList.add("flip");
        if (fb[j] === "🟩") tile.classList.add("feedback-correct");
        if (fb[j] === "🟨") tile.classList.add("feedback-present");
        if (fb[j] === "⬜️") tile.classList.add("feedback-absent");
      }

      row.appendChild(tile);
    }

    container.appendChild(row);
  }
}
