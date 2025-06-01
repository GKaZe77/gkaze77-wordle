import { renderBoard } from "../components/board.js";
import { renderKeyboard, updateKeyColors } from "../components/keyboard.js";
import { renderEndScreen } from "../components/endscreen.js";
import { evaluateGuess } from "../components/feedback.js";
import { setState } from "../utils/state.js";

const MAX_GUESSES = 6;
const STORAGE_KEY_PREFIX = "wordle-blueprint";
let wordlist = [];
let guesses = [];
let feedbacks = [];
let targetWord = "";
let seedKey = "";
let seedUsed = false;
let aiTier = Math.floor(Math.random() * 4) + 1;

init();

async function init() {
  try {
    wordlist = await fetch("../data/wordlist.json").then(res => res.json());
  } catch {
    wordlist = ["WORDL"];
  }

  const metadata = await getSeedOrFallback(wordlist);
  targetWord = metadata.word;
  seedKey = metadata.key;

  updateTitle();
  updateSeedStatus();

  prefillWithAI();
  guesses.push("");
  feedbacks.push(null);

  renderBoard(MAX_GUESSES, guesses, feedbacks);
  renderKeyboard(onKeyPress);
  setupTimer();
  setState({ guesses, feedbacks });

  document.getElementById("reset-button")?.addEventListener("click", () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}-${seedKey}`);
    location.reload();
  });

  window.addEventListener("keydown", (e) => {
    let key = e.key.toUpperCase();
    if (key === "BACKSPACE") key = "⌫";
    if (key === "ENTER") key = "ENTER";
    if ((/^[A-Z]$/.test(key) && key.length === 1) || key === "ENTER" || key === "⌫") {
      onKeyPress(key);
    }
  });
}

function onKeyPress(letter) {
  const rowIndex = guesses.length - 1;
  let row = guesses[rowIndex] || "";

  if (feedbacks[rowIndex]) return;

  if (letter === "ENTER") {
    if (row.length !== 5 || !wordlist.includes(row.toUpperCase())) return;

    row = row.toUpperCase();
    const fb = evaluateGuess(row, targetWord);
    guesses[rowIndex] = row;
    feedbacks[rowIndex] = fb;

    updateKeyColors(fb, row);
    renderBoard(MAX_GUESSES, guesses, feedbacks, rowIndex);
    renderEndScreen(row === targetWord, targetWord, () => location.reload());

    if (seedUsed && !seedKey.startsWith("random-")) {
      localStorage.setItem(`used-${STORAGE_KEY_PREFIX}-${seedKey}`, "1");
    }
  } else if (letter === "⌫") {
    guesses[rowIndex] = row.slice(0, -1);
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  } else if (/^[A-Z]$/.test(letter) && row.length < 5) {
    guesses[rowIndex] = row + letter;
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  }

  setState({ guesses, feedbacks });
}

async function getSeedOrFallback(wordlist) {
  try {
    const res = await fetch("https://api.gkaze77.com/wordle/seed?mode=blueprint");
    const data = await res.json();
    if (data?.word && data?.seed) {
      const played = localStorage.getItem(`used-${STORAGE_KEY_PREFIX}-${data.seed}`);
      if (!played) {
        seedUsed = true;
        return { word: data.word.toUpperCase(), key: data.seed };
      }
    }
  } catch (err) {
    console.warn("Seed fetch failed. Using fallback.", err);
  }

  const blacklist = new Set(["YENTE", "RESEE", "ABASE", "REUSE", "WORDS"]);
  const filtered = wordlist.filter(w => !blacklist.has(w.toUpperCase()));
  const fallback = filtered[Math.floor(Math.random() * filtered.length)]?.toUpperCase() || "WORDL";
  const key = `random-${fallback}-${Date.now()}`;
  return { word: fallback, key };
}

function updateSeedStatus() {
  const el = document.getElementById("seed-info");
  el.textContent = seedUsed
    ? `🧩 Shared Wordle (Seed: ${seedKey})`
    : `🎲 Random Wordle (AI Tier ${aiTier})`;
}

function updateTitle() {
  const el = document.getElementById("game-title");
  if (el) {
    el.textContent = seedUsed ? "📐 Blueprint Wordle (Seed)" : "📐 Blueprint Wordle (Random)";
    el.title = seedUsed ? `Seed: ${seedKey}` : "Randomly generated logic board";
  }
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
    case 1: return ["SLATE", "CRANE", "AUDIO", "REACT", "POINT", "BLEND", "CHART", "RAISE"][Math.floor(Math.random() * 8)];
    case 2: return candidates.find(w => [...w].some(l => used.has(l))) || candidates[0];
    case 3: return candidates[Math.floor(Math.random() * candidates.length)];
    case 4: return bluff(candidates, targetWord) || candidates[0];
    default: return targetWord;
  }
}

function bluff(candidates, correct) {
  const wrong = candidates.filter(w => w !== correct && sharedLetters(w, correct) >= 3);
  return wrong[Math.floor(Math.random() * wrong.length)];
}

function sharedLetters(a, b) {
  return [...a].filter(l => b.includes(l)).length;
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
