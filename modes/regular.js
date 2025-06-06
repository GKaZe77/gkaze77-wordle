// modes/regular.js

import { renderBoard } from "../components/board.js";
import { renderKeyboard, updateKeyColors } from "../components/keyboard.js";
import { renderEndScreen } from "../components/endscreen.js";
import { evaluateGuess } from "../components/feedback.js";

const MAX_GUESSES = 6;
const STORAGE_KEY_PREFIX = "wordle-regular";

let wordToGuess = "";
let guesses = [];
let feedbacks = [];
let wordList = [];
let seedKey = "";
let mode = "seed";

const fallbackSeeds = ["CRANE", "AUDIO", "TRICK", "RAISE", "GHOST"];

async function init() {
  const urlParams = new URLSearchParams(location.search);
  const sharedSeed = urlParams.get("seed");

  try {
    const [seedRes, generalRes] = await Promise.all([
      fetch("https://api.gkaze77.com/wordlist/seed?mode=regular"),
      fetch("https://api.gkaze77.com/wordlist/wordlist_general.json"),
    ]);

    const seedData = await seedRes.json();
    wordList = (await generalRes.json()).map(w => w.toUpperCase());

    // 🎯 Shared Wordle link
    if (sharedSeed) {
      const index = Math.abs(Number(sharedSeed)) % wordList.length;
      wordToGuess = wordList[index];
      seedKey = sharedSeed;
      mode = "shared";

      const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY_PREFIX}-${seedKey}`) || "{}");
      if (saved.complete) throw new Error("Shared seed already completed.");

      if (saved.word && saved.guesses && saved.feedbacks) {
        guesses = saved.guesses;
        feedbacks = saved.feedbacks;
      } else {
        guesses = [""];
        feedbacks = [];
        saveProgress();
      }

      return finalizeGame();
    }

    // ✅ Fix: allow 0 seed
    if (!seedData || !seedData.word || seedData.seed == null)
      throw new Error("Seed response invalid");

    if (!wordList.includes(seedData.word.toUpperCase())) {
      wordList.push(seedData.word.toUpperCase());
    }

    seedKey = seedData.seed;
    const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY_PREFIX}-${seedKey}`) || "{}");

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
  } catch (err) {
    console.warn("⚠️ Fallback mode triggered:", err.message);
    wordList = fallbackSeeds;
    wordToGuess = fallbackSeeds[Math.floor(Math.random() * fallbackSeeds.length)].toUpperCase();
    guesses = [""];
    feedbacks = [];
    mode = "random";
    seedKey = `random-${Date.now()}`;
  }

  finalizeGame();
}

function finalizeGame() {
  updateTitle();
  renderBoard(MAX_GUESSES, guesses, feedbacks);
  updateKeyboardFromSavedGuesses();
  renderKeyboard(onKeyPress);
  startCountdown();

  console.log("🟩 Mode:", mode, "| SeedKey:", seedKey, "| Word:", wordToGuess);
}

function onKeyPress(letter) {
  const currentIndex = guesses.length - 1;
  let currentGuess = guesses[currentIndex] || "";
  if (feedbacks[currentIndex]) return;

  if (letter === "ENTER") {
    if (currentGuess.length !== 5) return shakeRow(currentIndex);
    if (!wordList.includes(currentGuess.toUpperCase())) return shakeRow(currentIndex);

    currentGuess = currentGuess.toUpperCase();
    const fb = evaluateGuess(currentGuess, wordToGuess);

    guesses[currentIndex] = currentGuess;
    feedbacks[currentIndex] = fb;
    updateKeyColors(fb, currentGuess);
    renderBoard(MAX_GUESSES, guesses, feedbacks, currentIndex);
    saveProgress();

    const isCorrect = currentGuess === wordToGuess;
    const gameOver = isCorrect || guesses.length >= MAX_GUESSES;

    if (gameOver) {
      renderEndScreen(isCorrect, wordToGuess, startFreshGame);
      if (mode === "seed" || mode === "shared") {
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

  let title = "🟩 Regular Wordle";
  let subtitle = "";

  switch (mode) {
    case "seed":
      title += " (Seed)";
      subtitle = `Shared Word of the Hour\nSeed: ${seedKey}`;
      break;
    case "shared":
      title += " (Shared)";
      subtitle = `Custom Shared Game\nSeed: ${seedKey}`;
      break;
    default:
      title += " (Random)";
      subtitle = "Offline/random fallback game";
  }

  el.textContent = title;
  el.title = subtitle;
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

document.getElementById("create-button")?.addEventListener("click", async () => {
  try {
    const res = await fetch("https://api.gkaze77.com/wordlist/wordlist_general.json");
    let wordlist = await res.json();
    wordlist = wordlist.map(w => w.toUpperCase());

    const input = prompt("Enter a 5-letter word from the list:");
    const word = input?.trim().toUpperCase();

    if (!word || word.length !== 5 || !wordlist.includes(word)) {
      alert("Invalid or unknown word.");
      return;
    }

    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }

    const url = `${location.origin}/modes/regular.html?seed=${Math.abs(hash)}`;
    await navigator.clipboard.writeText(url);
    alert("✅ Wordle link copied to clipboard:\n" + url);
  } catch {
    alert("❌ Failed to generate link.");
  }
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
