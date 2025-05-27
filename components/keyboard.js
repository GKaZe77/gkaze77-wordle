import { getState } from "../utils/state.js";

const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"]
];

const keyboardContainer = document.getElementById("keyboard");
const keyClassMap = {}; // Tracks best known status per letter
let lastKeyHandler = null; // Stores the last bound onKeyPress callback

export function renderKeyboard(onKeyPress = null) {
  if (onKeyPress) {
    lastKeyHandler = onKeyPress;
  }

  keyboardContainer.innerHTML = "";

  keyboardLayout.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach((key) => {
      const button = document.createElement("button");
      button.textContent = key;
      button.classList.add("keyboard-key");

      const status = keyClassMap[key];
      if (status) {
        button.classList.add(`key-${status}`);
      }

      button.setAttribute("data-key", key);
      if (lastKeyHandler) {
        button.addEventListener("click", () => lastKeyHandler(key));
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
    const status = emojiToStatus(fb);

    if (!keyClassMap[letter] || statusPriority(status) > statusPriority(keyClassMap[letter])) {
      keyClassMap[letter] = status;
    }
  }

  renderKeyboard(); // Re-render with preserved event binding
}

function emojiToStatus(symbol) {
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