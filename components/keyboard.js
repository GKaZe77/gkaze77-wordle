import { getState } from "../utils/state.js";

const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"]
];

const keyboardContainer = document.getElementById("keyboard");

export function renderKeyboard() {
  keyboardContainer.innerHTML = "";

  const { guesses = [], feedback = [] } = getState();
  const keyStatus = computeKeyStatuses(guesses, feedback);

  keyboardLayout.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach((key) => {
      const button = document.createElement("button");
      button.textContent = key;
      button.classList.add("keyboard-key");

      const status = keyStatus[key];
      if (status) {
        button.classList.add(`key-${status}`); // key-green, key-yellow, key-gray
      }

      button.setAttribute("data-key", key);
      rowDiv.appendChild(button);
    });

    keyboardContainer.appendChild(rowDiv);
  });
}

function computeKeyStatuses(guesses, feedback) {
  const statuses = {};

  guesses.forEach((word, guessIndex) => {
    word.split("").forEach((letter, i) => {
      const fb = feedback[guessIndex]?.[i];
      if (!fb) return;

      if (!statuses[letter] || priority(fb) > priority(statuses[letter])) {
        statuses[letter] = fb;
      }
    });
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
