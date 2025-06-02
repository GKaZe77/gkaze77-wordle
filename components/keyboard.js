const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"]
];

const keyboardContainer = document.getElementById("keyboard");
const keyClassMap = {};
let lastKeyHandler = null;

// 🔁 Called from game mode to draw keyboard
export function renderKeyboard(onKeyPress = null) {
  if (onKeyPress) lastKeyHandler = onKeyPress;
  if (!lastKeyHandler) return;

  keyboardContainer.innerHTML = "";

  keyboardLayout.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach((key) => {
      const normalized = key === "←" ? "⌫" : key; // normalize backspace
      const button = document.createElement("button");

      // Show visual symbol but attach actual key code
      button.textContent = key === "←" ? "⌫" : key === "ENTER" ? "⏎" : key;
      button.classList.add("keyboard-key");

      // Apply status-based class (🟩/🟨/⬜️)
      const status = keyClassMap[key];
      if (status) button.classList.add(`key-${status}`);

      button.setAttribute("data-key", normalized);
      button.addEventListener("click", () => lastKeyHandler(normalized));
      rowDiv.appendChild(button);
    });

    keyboardContainer.appendChild(rowDiv);
  });
}

// 🟩 Update visual color of keys based on feedback symbols
export function updateKeyColors(feedback, guess) {
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = emojiToStatus(feedback[i]);

    if (
      !keyClassMap[letter] ||
      statusPriority(status) > statusPriority(keyClassMap[letter])
    ) {
      keyClassMap[letter] = status;
    }
  }

  renderKeyboard(); // re-render with new colors
}

// 🎨 Convert tile emoji to CSS class suffix
function emojiToStatus(symbol) {
  return symbol === "🟩" ? "green" :
         symbol === "🟨" ? "yellow" :
         symbol === "⬜️" ? "gray" : null;
}

// 🔢 Green beats yellow beats gray
function statusPriority(status) {
  return status === "green" ? 3 :
         status === "yellow" ? 2 :
         status === "gray" ? 1 : 0;
}
