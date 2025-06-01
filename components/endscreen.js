// components/endscreen.js

/**
 * Renders the end screen UI.
 * @param {boolean} isWin - Whether the player won.
 * @param {string} word - The correct word.
 * @param {Function} onReset - Callback for reset button.
 */
export async function renderEndScreen(isWin, word, onReset) {
  const container = document.getElementById("endscreen");
  container.innerHTML = "";

  const message = document.createElement("div");
  message.className = "end-message";

  const title = document.createElement("h2");
  title.textContent = isWin ? "🎉 You Win!" : "❌ You Lose!";
  message.appendChild(title);

  const answer = document.createElement("p");
  answer.textContent = `The word was: ${word}`;
  message.appendChild(answer);

  const def = document.createElement("p");
  def.textContent = "Looking up definition...";
  message.appendChild(def);

  try {
    const res = await fetch(`https://api.gkaze77.com/wordle/definition?word=${word}`);
    if (!res.ok) throw new Error("Definition not found");
    const data = await res.json();

    def.textContent = data.definition
      ? `🧠 ${data.partOfSpeech}: ${data.definition}`
      : "❔ No definition found.";
  } catch {
    def.textContent = "❔ No definition found.";
  }

  const button = document.createElement("button");
  button.textContent = "Play Again";
  button.addEventListener("click", onReset);
  message.appendChild(button);

  container.appendChild(message);
}
