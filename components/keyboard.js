const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"]
];

export function renderKeyboard(onKeyPress) {
  const container = document.getElementById("keyboard");
  if (!container) return;
  container.innerHTML = "";

  keyboardLayout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyboard-row";

    row.forEach(keyChar => {
      const key = document.createElement("button");
      key.className = "keyboard-key";
      key.textContent = keyChar;
      key.setAttribute("data-key", keyChar);
      key.onclick = () => {
        const normalized = keyChar === "←" ? "⌫" : keyChar;
        onKeyPress(normalized);
      };
      rowDiv.appendChild(key);
    });

    container.appendChild(rowDiv);
  });
}

export function updateKeyColors(feedback, guess) {
  for (let i = 0; i < feedback.length; i++) {
    const key = document.querySelector(`.keyboard-key[data-key='${guess[i]}']`);
    if (!key) continue;

    const currentClass = key.classList;
    const newState = feedback[i];

    if (newState === "🟩") {
      currentClass.remove("key-yellow", "key-gray");
      currentClass.add("key-green");
    } else if (newState === "🟨") {
      if (!currentClass.contains("key-green")) {
        currentClass.remove("key-gray");
        currentClass.add("key-yellow");
      }
    } else if (newState === "⬜️") {
      if (!currentClass.contains("key-green") && !currentClass.contains("key-yellow")) {
        currentClass.add("key-gray");
      }
    }
  }
}