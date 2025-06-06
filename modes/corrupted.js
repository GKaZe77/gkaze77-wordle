// modes/corrupted.js

import { renderBoard } from "../components/board.js";
import { renderKeyboard, updateKeyColors } from "../components/keyboard.js";
import { renderEndScreen } from "../components/endscreen.js";
import { evaluateGuess } from "../components/feedback.js";

const MAX_GUESSES = 6;
const STORAGE_KEY_PREFIX = "wordle-corrupted";

let wordToGuess = "";
let guesses = [];
let feedbacks = [];
let wordList = [];         // all guessable words
let seedKey = "";
let mode = "seed";         // or 'random'

// fallback list for full offline resilience
const fallbackSeeds = ["TRICK", "GLARE", "MORAL", "SHOCK", "VIRAL"];

async function init() {
  try {
    const [seedRes, generalRes] = await Promise.all([
      fetch("https://api.gkaze77.com/wordlist/wordlist_seed.json?mode=corrupted"),
      fetch("https://api.gkaze77.com/wordlist/wordlist_general.json"),
    ]);

    const seedData = await seedRes.json();
    wordList = await generalRes.json();

    // ✅ Ensure seed word is valid
    if (!wordList.includes(seedData.word.toUpperCase())) {
      wordList.push(seedData.word.toUpperCase());
    }

    if (seedData?.word && seedData?.seed) {
      seedKey = seedData.seed;
      const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY_PREFIX}-${seedKey}`) || "{}");

      // ✅ Check if player already finished this seed game
      if (saved.complete) throw new Error("Seed already completed.");

      if (saved.word && saved.guesses && saved.feedbacks) {
        wordToGuess = saved.word;
        guesses = saved.guesses;
        feedbacks = saved.feedbacks;
        mode = saved.mode || "seed";
      } else {
        wordToGuess = seedData.word.toUpperCase();
        guesses = [""];
        feedbacks = [];
        saveProgress();
      }
    } else {
      throw new Error("Invalid seed response");
    }
  } catch {
    // fallback: random mode
    wordToGuess = fallbackSeeds[Math.floor(Math.random() * fallbackSeeds.length)].toUpperCase();
    guesses = [""];
    feedbacks = [];
    wordList = fallbackSeeds;
    mode = "random";
    seedKey = `random-${Date.now()}`;
  }

  updateTitle();
  renderBoard(MAX_GUESSES, guesses, feedbacks);
  updateKeyboardFromSavedGuesses();
  renderKeyboard(onKeyPress);
  startCountdown();

  console.log("🧪 Mode:", mode, "| SeedKey:", seedKey, "| Word:", wordToGuess);
}

function onKeyPress(letter) {
  const currentIndex = guesses.length - 1;
  let currentGuess = guesses[currentIndex] || "";
  if (feedbacks[currentIndex]) return;

  if (letter === "ENTER") {
    if (currentGuess.length !== 5) return shakeRow(currentIndex);
    if (!wordList.includes(currentGuess.toUpperCase())) return shakeRow(currentIndex);

    currentGuess = currentGuess.toUpperCase();
    const trueFeedback = evaluateGuess(currentGuess, wordToGuess);
    const glitchedFeedback = applyGlitch(trueFeedback);

    guesses[currentIndex] = currentGuess;
    feedbacks[currentIndex] = glitchedFeedback;
    updateKeyColors(glitchedFeedback, currentGuess);
    renderBoard(MAX_GUESSES, guesses, feedbacks, currentIndex);
    saveProgress();

    const isCorrect = currentGuess === wordToGuess;
    const gameOver = isCorrect || guesses.length >= MAX_GUESSES;

    if (gameOver) {
      renderEndScreen(isCorrect, wordToGuess, startFreshGame);
      if (mode === "seed") {
        // ✅ Save final state to block replays of same seed
        localStorage.setItem(`${STORAGE_KEY_PREFIX}-${seedKey}`, JSON.stringify({
          word: wordToGuess,
          guesses,
          feedbacks,
          mode,
          complete: true
        }));
      }
    } else {
      guesses.push("");
    }
  } else if (letter === "⌫") {
    guesses[currentIndex] = currentGuess.slice(0, -1);
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  } else if (/^[A-Z]$/.test(letter) && currentGuess.length < 5) {
    guesses[currentIndex] = currentGuess + letter;
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  }
}

function applyGlitch(feedback) {
  return feedback.map(symbol => (Math.random() < 0.2 ? "⬜️" : symbol));
}

function shakeRow(index) {
  const rows = document.querySelectorAll(".guess-row");
  const row = rows[index];
  if (!row) return;
  row.classList.add("shake");
  setTimeout(() => row.classList.remove("shake"), 600);
}

function saveProgress() {
  if (!seedKey) return;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}-${seedKey}`, JSON.stringify({
    word: wordToGuess,
    guesses,
    feedbacks,
    mode
  }));
}

function updateKeyboardFromSavedGuesses() {
  for (let i = 0; i < feedbacks.length; i++) {
    if (feedbacks[i]?.length === 5) {
      updateKeyColors(feedbacks[i], guesses[i]);
    }
  }
}

function updateTitle() {
  const el = document.getElementById("game-title");
  if (!el) return;

  el.textContent = mode === "seed" ? "🧪 Corrupted Wordle (Seed)" : "🧪 Corrupted Wordle (Random)";
  el.title = mode === "seed"
    ? `Shared Corrupted Word of the Hour\nSeed: ${seedKey}`
    : "Offline/random corrupted game";
}

function startCountdown() {
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

function startFreshGame() {
  const lastGuess = guesses.find(g => g.length === 5);
  if (!lastGuess) return alert("Play a valid word first!");

  const hash = Math.abs([...lastGuess].reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0));
  const url = `${location.origin}${location.pathname}?seed=${hash}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("✅ Sharable link copied:\n" + url);
  });
}

document.getElementById("reset-button")?.addEventListener("click", startFreshGame);

window.addEventListener("keydown", (e) => {
  let key = e.key;
  if (key === "Backspace") key = "⌫";
  else if (key === "Enter") key = "ENTER";
  else if (/^[a-zA-Z]$/.test(key)) key = key.toUpperCase();
  else return;
  onKeyPress(key);
});

window.onload = init;
