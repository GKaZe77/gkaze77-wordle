// modes/blueprint.js

import { renderBoard } from "../components/board.js";
import { renderKeyboard, updateKeyColors } from "../components/keyboard.js";
import { renderEndScreen } from "../components/endscreen.js";
import { evaluateGuess } from "../components/feedback.js";

const MAX_GUESSES = 6;
const STORAGE_KEY_PREFIX = "wordle-blueprint";

let wordToGuess = "";
let guesses = [];
let feedbacks = [];
let wordList = [];
let seedKey = "";
let seedUsed = false;
let aiTier = Math.floor(Math.random() * 4) + 1;

const fallbackSeeds = ["LOGIC", "CRANE", "AUDIO", "RAISE", "POINT"];

async function init() {
  try {
    const urlParams = new URLSearchParams(location.search);
    const sharedSeed = urlParams.get("seed");

    const [seedRes, generalRes] = await Promise.all([
      fetch("https://api.gkaze77.com/wordlist/wordlist_seed.json?mode=blueprint"),
      fetch("https://api.gkaze77.com/wordlist/wordlist_general.json"),
    ]);

    wordList = (await generalRes.json()).map(w => w.toUpperCase());

    if (sharedSeed) {
      const index = Math.abs(Number(sharedSeed)) % wordList.length;
      wordToGuess = wordList[index];
      seedKey = sharedSeed;
      seedUsed = true;

      const wasUsed = localStorage.getItem(`used-${STORAGE_KEY_PREFIX}-${seedKey}`) === "1";
      if (wasUsed) throw new Error("Seed already played");
    } else {
      const seedData = await seedRes.json();
      const seedWord = seedData.word.toUpperCase();
      seedKey = seedData.seed;

      if (!wordList.includes(seedWord)) wordList.push(seedWord);

      wordToGuess = seedWord;
      seedUsed = true;

      const wasUsed = localStorage.getItem(`used-${STORAGE_KEY_PREFIX}-${seedKey}`) === "1";
      if (wasUsed) throw new Error("Seed already played");
    }
  } catch {
    wordList = fallbackSeeds;
    wordToGuess = fallbackSeeds[Math.floor(Math.random() * fallbackSeeds.length)].toUpperCase();
    seedKey = `random-${Date.now()}`;
    seedUsed = false;
  }

  updateTitle();
  updateSeedInfo();
  prefillWithAI();
  guesses.push(""); // current player row
  renderBoard(MAX_GUESSES, guesses, feedbacks);
  renderKeyboard(onKeyPress);
  setupTimer();
}

function onKeyPress(letter) {
  const currentIndex = guesses.length - 1;
  let currentGuess = guesses[currentIndex] || "";
  if (feedbacks[currentIndex]) return;

  if (letter === "ENTER") {
    if (currentGuess.length !== 5 || !wordList.includes(currentGuess.toUpperCase())) {
      shakeRow(currentIndex);
      return;
    }

    currentGuess = currentGuess.toUpperCase();
    const fb = evaluateGuess(currentGuess, wordToGuess);
    guesses[currentIndex] = currentGuess;
    feedbacks[currentIndex] = fb;
    updateKeyColors(fb, currentGuess);
    renderBoard(MAX_GUESSES, guesses, feedbacks, currentIndex);

    const isCorrect = currentGuess === wordToGuess;
    renderEndScreen(isCorrect, wordToGuess, () => location.reload());

    if (seedUsed) {
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

function shakeRow(index) {
  const rows = document.querySelectorAll(".guess-row");
  const row = rows[index];
  if (!row) return;
  row.classList.add("shake");
  setTimeout(() => row.classList.remove("shake"), 600);
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
    case 1:
      return ["CRANE", "AUDIO", "RAISE", "POINT", "BLEND"][Math.floor(Math.random() * 5)];
    case 2:
      return candidates.find(w => [...w].some(l => used.has(l))) || candidates[0];
    case 3:
      return candidates[Math.floor(Math.random() * candidates.length)];
    case 4:
      return bluff(candidates, wordToGuess) || candidates[0];
    default:
      return wordToGuess;
  }
}

function bluff(candidates, target) {
  return candidates.find(w => w !== target && sharedLetters(w, target) >= 3);
}

function sharedLetters(a, b) {
  return [...a].filter(l => b.includes(l)).length;
}

function updateTitle() {
  const el = document.getElementById("game-title");
  if (!el) return;
  el.textContent = seedUsed ? "🧩 Blueprint Wordle (Seed)" : "🧩 Blueprint Wordle (Random)";
  el.title = seedUsed ? `Seed: ${seedKey}` : "AI-generated logic board";
}

function updateSeedInfo() {
  const el = document.getElementById("seed-info");
  if (!el) return;
  el.textContent = seedUsed ? `Shared Blueprint (Seed: ${seedKey})` : `AI Tier ${aiTier}`;
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

document.getElementById("create-button")?.addEventListener("click", async () => {
  const input = prompt("Enter a 5-letter word to share:");
  const word = input?.trim().toUpperCase();
  const valid = word && word.length === 5 && wordList.includes(word);
  if (!valid) return alert("Invalid or unknown word.");

  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = (hash << 5) - hash + word.charCodeAt(i);
    hash |= 0;
  }

  const mode = "blueprint";
  const url = `${location.origin}/modes/${mode}.html?seed=${Math.abs(hash)}`;
  await navigator.clipboard.writeText(url);
  alert("🔗 Wordle link copied:\n" + url);
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
