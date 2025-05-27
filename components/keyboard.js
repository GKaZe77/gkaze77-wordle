import { getState } from "../utils/state.js";

const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"]
];

const keyboardContainer = document.getElementById("keyboard");

const keyClassMap = {}; // tracks best known status per letter

export function renderKeyboard(onKeyPress = null) {
  keyboardContainer.innerHTML = "";

  keyboardLayout.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach((key) => {
      const button = document.createElement("button");
      button.textContent = key;
      button.classList.add("keyboard-key");

      if (keyClassMap[key]) {
        button.classList.add(`key-${keyClassMap[key]}`);
      }

      button.setAttribute("data-key", key);
      if (onKeyPress) {
        button.addEventListener("click", () => onKeyPress(key));
      }

      rowDiv.appendChild(button);
    });

    keyboardContainer.appendChild(rowDiv);
  });
}

export function updateKeyColors(feedback, guess) {
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const fb = feedback[i];
    const status = feedbackToStatus(fb);

    if (!keyClassMap[letter] || statusPriority(status) > statusPriority(keyClassMap[letter])) {
      keyClassMap[letter] = status;
    }
  }

  renderKeyboard(); // re-render after update
}

function feedbackToStatus(symbol) {
  switch (symbol) {
    case "🟩": return "green";
    case "🟨": return "yellow";
    case "⬜️": return "gray";
    default: return null;
  }
}

function statusPriority(status) {
  switch (status) {
    case "green": return 3;
    case "yellow": return 2;
    case "gray": return 1;
    default: return 0;
  }
}
