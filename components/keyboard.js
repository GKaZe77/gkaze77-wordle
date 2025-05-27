import { getState } from "../utils/state.js";

const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"]
];

const keyboardContainer = document.getElementById("keyboard");
const keyClassMap = {}; // Tracks best known state per letter

export function renderKeyboard(onKeyPress = null) {
  keyboardContainer.innerHTML = "";

  keyboardLayout.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach((key) => {
      const button = document.createElement("button");
      button.textContent = key;
      button.classList.add("keyboard-key");

      const status = keyClassMap[key];
      if (status) button.classList.add(`key-${status}`);

      button.setAttribute("data-key", key);
      if (onKeyPress) button.addEventListener("click", () => onKeyPress(key));

      rowDiv.appendChild(button);
    });

    keyboardContainer.appendChild(rowDiv);
  });
}

export function updateKeyColors(feedback, guess) {
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = emojiToStatus(feedback[i]);

    if (!keyClassMap[letter] || statusPriority(status) > statusPriority(keyClassMap[letter])) {
      keyClassMap[letter] = status;
    }
  }

  renderKeyboard(); // Refresh visuals
}

function emojiToStatus(symbol) {
  return symbol === "🟩" ? "green" :
         symbol === "🟨" ? "yellow" :
         symbol === "⬜️" ? "gray" : null;
}

function statusPriority(status) {
  return status === "green" ? 3 :
         status === "yellow" ? 2 :
         status === "gray" ? 1 : 0;
}
