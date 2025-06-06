// components/endscreen.js

export function renderEndScreen(isCorrect, answer, onReset) {
  const container = document.getElementById("endscreen");
  if (!container) return;

  container.innerHTML = `
    <div class="endscreen">
      <h2>${isCorrect ? "🎉 You won!" : "❌ You lost."}</h2>
      <p>The word was <strong>${answer}</strong></p>
      <div id="definition-box">📖 Loading definition...</div>
      <button id="play-again">🔁 Play Again</button>
    </div>
  `;

  document.getElementById("play-again")?.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  fetch(`https://api.gkaze77.com/wordlist/definition?word=${answer}`)
    .then(res => res.ok ? res.json() : Promise.reject("Not found"))
    .then(data => {
      const def = data.definition || data.def || data.text || "Definition not available.";
      document.getElementById("definition-box").textContent = def;
    })
    .catch(() => {
      document.getElementById("definition-box").textContent = "❌ No definition found.";
    });
}
