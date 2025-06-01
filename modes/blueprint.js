import { renderBoard } from "../components/board.js";
import { renderKeyboard, updateKeyColors } from "../components/keyboard.js";
import { renderEndScreen } from "../components/endscreen.js";
import { evaluateGuess } from "../components/feedback.js";

const MAX_GUESSES = 6;
const STORAGE_KEY_PREFIX = "wordle-blueprint";
let wordList = [];
let guesses = [];
let feedbacks = [];
let wordToGuess = "";
let seedKey = "";
let seedUsed = false;
let aiTier = Math.floor(Math.random() * 4) + 1;

async function init() {
  try {
   const seedRes = await fetch("https://api.gkaze77.com/wordle/seed?mode=...");
const generalRes = await fetch("https://api.gkaze77.com/wordle/wordlist-general");

const generalWords = await generalRes.json(); // for validation
const seedData = await seedRes.json(); // for official seed
wordList = generalWords;
wordToGuess = seedData.word.toUpperCase();

  } catch {
    wordList = ["LOGIC"];
  }

  try {
    const res = await fetch("https://api.gkaze77.com/wordle/seed?mode=blueprint");
    const data = await res.json();
    if (data?.word && data?.seed) {
      seedUsed = true;
      seedKey = data.seed;
      wordToGuess = data.word.toUpperCase();
    }
  } catch {
    const fallback = wordList[Math.floor(Math.random() * wordList.length)]?.toUpperCase() || "ERROR";
    wordToGuess = fallback;
    seedKey = `random-${Date.now()}`;
  }

  updateTitle();
  updateSeedInfo();

  prefillWithAI();
  guesses.push("");
  feedbacks.push(null);

  renderBoard(MAX_GUESSES, guesses, feedbacks);
  renderKeyboard(onKeyPress);
  setupTimer();
}

function onKeyPress(letter) {
  const currentIndex = guesses.length - 1;
  let currentGuess = guesses[currentIndex] || '';
  if (feedbacks[currentIndex]) return;

  if (letter === 'ENTER') {
    if (currentGuess.length !== 5 || !wordList.includes(currentGuess.toUpperCase())) return;

    currentGuess = currentGuess.toUpperCase();
    const fb = evaluateGuess(currentGuess, wordToGuess);
    guesses[currentIndex] = currentGuess;
    feedbacks[currentIndex] = fb;

    updateKeyColors(fb, currentGuess);
    renderBoard(MAX_GUESSES, guesses, feedbacks, currentIndex);

    const isCorrect = currentGuess === wordToGuess;
    renderEndScreen(isCorrect, wordToGuess, () => location.reload());

    if (!seedKey.startsWith("random-")) {
      localStorage.setItem(`used-${STORAGE_KEY_PREFIX}-${seedKey}`, "1");
    }
  } else if (letter === "⌫") {
    guesses[currentIndex] = currentGuess.slice(0, -1);
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  } else if (/^[A-Z]$/.test(letter) && currentGuess.length < 5) {
    guesses[currentIndex] = currentGuess + letter;
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  }
}

function prefillWithAI() {
  let known = Array(5).fill(null);
  let used = new Set();

  for (let i = 0; i < 5; i++) {
    const guess = generateGuess(wordList, known, used);
    const fb = evaluateGuess(guess, wordToGuess);

    fb.forEach((f, idx) => {
      if (f === "🟩") known[idx] = guess[idx];
      if (f !== "⬜️") used.add(guess[idx]);
    });

    guesses.push(guess);
    feedbacks.push(fb);
  }
}

function generateGuess(list, known, used) {
  const candidates = list.filter(w => known.every((c, i) => !c || w[i] === c));
  switch (aiTier) {
    case 1: return ["CRANE", "AUDIO", "RAISE", "POINT", "BLEND"][Math.floor(Math.random() * 5)];
    case 2: return candidates.find(w => [...w].some(l => used.has(l))) || candidates[0];
    case 3: return candidates[Math.floor(Math.random() * candidates.length)];
    case 4: return bluff(candidates, wordToGuess) || candidates[0];
    default: return wordToGuess;
  }
}

function bluff(candidates, target) {
  return candidates.filter(w => w !== target && sharedLetters(w, target) >= 3)[0];
}

function sharedLetters(a, b) {
  return [...a].filter(l => b.includes(l)).length;
}

function updateTitle() {
  const el = document.getElementById("game-title");
  if (!el) return;
  el.textContent = seedUsed ? "📐 Blueprint Wordle (Seed)" : "📐 Blueprint Wordle (Random)";
  el.title = seedUsed ? `Seed: ${seedKey}` : "AI-generated logic board";
}

function updateSeedInfo() {
  const el = document.getElementById("seed-info");
  if (!el) return;
  el.textContent = seedUsed
    ? `🧩 Shared Blueprint (Seed: ${seedKey})`
    : `🎲 AI Tier ${aiTier}`;
}

function setupTimer() {
  const el = document.getElementById("timer");
  function update() {
    const ms = 3600000 - (Date.now() % 3600000);
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    el.textContent = `⏱ Next word in ${m}:${s.toString().padStart(2, "0")}`;
  }
  update();
  setInterval(update, 1000);
}

document.getElementById("reset-button")?.addEventListener("click", () => {
  localStorage.removeItem(`used-${STORAGE_KEY_PREFIX}-${seedKey}`);
  location.reload();
});

window.addEventListener("keydown", (e) => {
  let key = e.key;
  if (key === "Backspace") key = "⌫";
  else if (key === "Enter") key = "ENTER";
  else if (/^[a-zA-Z]$/.test(key)) key = key.toUpperCase();
  else return;
  onKeyPress(key);
});

window.onload = init;
