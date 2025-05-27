import { getSeedMetadata } from "../utils/seed.js";
import { evaluateGuess } from "../components/feedback.js";
import { renderBoard } from "../components/board.js";
import { renderEndScreen } from "../components/endscreen.js";
import { setState } from "../utils/state.js";

const MAX_GUESSES = 6;
const inputBox = document.getElementById("solution-input");
const resultText = document.getElementById("result-text");
const seedInfo = document.getElementById("seed-info");

let wordlist = [];
let guesses = [];
let feedbacks = [];
let targetWord = "";
let aiTier = 1;
let seedKey = "";

fetch("../data/wordlist.json")
  .then(res => res.json())
  .then(words => {
    wordlist = words;
    const seed = getSeedFromURL();
    const metadata = getSeedMetadata(wordlist, "blueprint");
    targetWord = metadata.word;
    seedKey = metadata.key;
    aiTier = Math.floor(Math.random() * 4) + 1;

    seedInfo.textContent = seed
      ? `🧩 Shared Wordle (Seed: ${seed})`
      : `🎲 Random Wordle (AI Tier ${aiTier})`;

    prefillWithAI();
    guesses.push(""); // Player's turn
    feedbacks.push(null);

    renderBoard(MAX_GUESSES, guesses, feedbacks);
    setState({ guesses, feedbacks });
    setupInput();
    setupTimer();
  });

function setupInput() {
  document.addEventListener("keydown", (e) => {
    const rowIndex = 5;
    let row = guesses[rowIndex] || "";

    if (feedbacks[rowIndex]) return;

    if (e.key === "Enter") {
      if (row.length !== 5 || !wordlist.includes(row.toUpperCase())) {
        resultText.textContent = "❗ Invalid word.";
        return;
      }
      row = row.toUpperCase();
      const fb = evaluateGuess(row, targetWord);
      guesses[rowIndex] = row;
      feedbacks[rowIndex] = fb;
      renderBoard(MAX_GUESSES, guesses, feedbacks, rowIndex);
      renderEndScreen(row === targetWord, targetWord, () => location.reload());
    } else if (e.key === "Backspace") {
      guesses[rowIndex] = row.slice(0, -1);
      renderBoard(MAX_GUESSES, guesses, feedbacks);
    } else if (/^[a-zA-Z]$/.test(e.key) && row.length < 5) {
      guesses[rowIndex] = row + e.key.toUpperCase();
      renderBoard(MAX_GUESSES, guesses, feedbacks);
    }

    setState({ guesses, feedbacks });
  });

  document.getElementById("reset-button")?.addEventListener("click", () => {
    localStorage.removeItem(`wordle-blueprint-${seedKey}`);
    location.reload();
  });
}

function prefillWithAI() {
  let known = Array(5).fill(null);
  let used = new Set();

  for (let i = 0; i < 5; i++) {
    const guess = generateGuess(wordlist, known, used);
    const fb = evaluateGuess(guess, targetWord);

    fb.forEach((f, idx) => {
      if (f === "🟩") known[idx] = guess[idx];
      if (f !== "⬜️") used.add(guess[idx]);
    });

    guesses.push(guess);
    feedbacks.push(fb);
  }
}

function generateGuess(wordlist, known, used) {
  const candidates = wordlist.filter(w =>
    known.every((c, i) => !c || w[i] === c)
  );

  switch (aiTier) {
    case 1:
      return ["SLATE", "CRANE", "AUDIO", "REACT", "POINT", "BLEND", "CHART", "RAISE"][Math.floor(Math.random() * 8)];
    case 2:
      return candidates.find(w => [...w].some(l => used.has(l))) || candidates[0];
    case 3:
      return candidates[Math.floor(Math.random() * candidates.length)];
    case 4:
      return bluff(candidates, targetWord) || candidates[0];
    default:
      return targetWord;
  }
}

function bluff(candidates, correct) {
  const wrong = candidates.filter(w => w !== correct && sharedLetters(w, correct) >= 3);
  return wrong[Math.floor(Math.random() * wrong.length)];
}

function sharedLetters(a, b) {
  return [...a].filter(l => b.includes(l)).length;
}

function getSeedFromURL() {
  const p = new URLSearchParams(location.search);
  return p.get("seed");
}

function setupTimer() {
  const timer = document.createElement("p");
  timer.id = "timer";
  timer.style.color = "#aaa";
  document.querySelector("footer")?.appendChild(timer);

  function update() {
    const ms = 3600000 - (Date.now() % 3600000);
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    timer.textContent = `⏱ Next word in ${m}:${s.toString().padStart(2, "0")}`;
  }

  update();
  setInterval(update, 1000);
}
