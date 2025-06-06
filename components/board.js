export function renderBoard(maxRows, guesses, feedbacks, activeRow = -1) {
  const container = document.getElementById("game-container");
  if (!container) return;
  container.innerHTML = "";

  for (let row = 0; row < maxRows; row++) {
    const div = document.createElement("div");
    div.className = "guess-row";

    const word = guesses[row] || "";
    const fb = feedbacks[row] || [];

    for (let col = 0; col < 5; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";

      const char = word[col] || "";
      tile.textContent = char;

      if (fb[col]) {
        // Only apply flip if this row is the one just completed
        if (row === activeRow) {
          tile.classList.add("flip");
        }

        if (fb[col] === "🟩") tile.classList.add("feedback-correct");
        else if (fb[col] === "🟨") tile.classList.add("feedback-present");
        else tile.classList.add("feedback-absent");
      }

      div.appendChild(tile);
    }

    // Add typing animation only to current incomplete row
    if (row === activeRow && !feedbacks[row]) {
      div.classList.add("active-row");
    }

    container.appendChild(div);
  }
}