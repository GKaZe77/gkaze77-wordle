import { getGameState } from "../utils/state.js";

const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"]
];

const keyboardContainer = document.getElementById("keyboard");

export function renderKeyboard() {
  keyboardContainer.innerHTML = "";

  const state = getGameState();
  const keyStatuses = computeKeyStatuses(state);

  keyboardLayout.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach((key) => {
      const button = document.createElement("button");
      button.textContent = key;
      button.classList.add("keyboard-key");

      if (keyStatuses[key]) {
        button.classList.add(`key-${keyStatuses[key]}`); // key-green, key-yellow, key-gray
      }

      button.setAttribute("data-key", key);
      rowDiv.appendChild(button);
    });

    keyboardContainer.appendChild(rowDiv);
  });
}

// Prioritizes: green > yellow > gray
function computeKeyStatuses(state) {
  const statuses = {};

  state.guesses.forEach((guess, i) => {
    const feedback = state.feedback[i];

    for (let j = 0; j < guess.length; j++) {
      const letter = guess[j];
      const fb = feedback[j]; // 'green', 'yellow', 'gray'

      if (!statuses[letter] || priority(fb) > priority(statuses[letter])) {
        statuses[letter] = fb;
      }
    }
  });

  return statuses;
}

function priority(status) {
  switch (status) {
    case "green": return 3;
    case "yellow": return 2;
    case "gray": return 1;
    default: return 0;
  }
}
