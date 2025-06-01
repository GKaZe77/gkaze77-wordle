import { renderBoard } from "../components/board.js";
import { renderKeyboard, updateKeyColors } from "../components/keyboard.js";
import { renderEndScreen } from "../components/endscreen.js";
import { evaluateGuessWithGlitch } from "../components/feedback.js";

const MAX_GUESSES = 6;
const STORAGE_KEY_PREFIX = "wordle-corrupted";
let wordlist = [];
let guesses = [];
let feedbacks = [];
let targetWord = "";
let seedKey = "";
let seedUsed = false;

let state = {};
function getState() { return state; }
function setState(partial) { state = { ...state, ...partial }; }

init();

async function init() {
  try {
    wordlist = await fetch("../data/wordlist.json").then(res => res.json());
  } catch {
    wordlist = ["TRICK"];
  }

  const metadata = await getSeedOrFallback(wordlist);
  targetWord = metadata.word;
  seedKey = metadata.key;

  guesses = [""];
  feedbacks = [];

  renderBoard(MAX_GUESSES, guesses, feedbacks);
  renderKeyboard(onKeyPress);
  setupTimer();
  updateTitle();
  setState({ guesses, feedbacks });

  document.getElementById("reset-button")?.addEventListener("click", () => {
    if (seedUsed && !seedKey.startsWith("random-")) {
      localStorage.setItem(`used-${STORAGE_KEY_PREFIX}-${seedKey}`, "1");
    }
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
}

function onKeyPress(letter) {
  const i = guesses.length - 1;
  let row = guesses[i] || "";
  if (feedbacks[i]) return;

  if (letter === "ENTER") {
    if (row.length !== 5 || !wordlist.includes(row.toUpperCase())) return;

    row = row.toUpperCase();
    const fb = evaluateGuessWithGlitch(row, targetWord);
    guesses[i] = row;
    feedbacks[i] = fb;

    updateKeyColors(fb, row);
    renderBoard(MAX_GUESSES, guesses, feedbacks, i);

    const win = row === targetWord;
    if (win || guesses.length >= MAX_GUESSES) {
      renderEndScreen(win, targetWord, () => location.reload());
      if (seedUsed && !seedKey.startsWith("random-")) {
        localStorage.setItem(`used-${STORAGE_KEY_PREFIX}-${seedKey}`, "1");
      }
    } else {
      guesses.push("");
    }

    setState({ guesses, feedbacks });
  } else if (letter === "⌫") {
    guesses[i] = row.slice(0, -1);
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  } else if (/^[A-Z]$/.test(letter) && row.length < 5) {
    guesses[i] = row + letter;
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  }

  setState({ guesses, feedbacks });
}

async function getSeedOrFallback(wordlist) {
  try {
    const res = await fetch("https://api.gkaze77.com/wordle/seed?mode=corrupted");
    const data = await res.json();
    if (data?.word && data?.seed) {
      const played = localStorage.getItem(`used-${STORAGE_KEY_PREFIX}-${data.seed}`);
      if (!played) {
        seedUsed = true;
        return { word: data.word.toUpperCase(), key: data.seed };
      }
    }
  } catch {}
  const fallback = wordlist[Math.floor(Math.random() * wordlist.length)];
  return { word: fallback.toUpperCase(), key: `random-${Date.now()}` };
}

function updateTitle() {
  const el = document.getElementById("game-title");
  if (!el) return;
  el.textContent = seedUsed ? "🧪 Corrupted Wordle (Seed)" : "🧪 Corrupted Wordle (Random)";
  el.title = seedUsed ? `Seed: ${seedKey}` : "Random logic puzzle with glitches";
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
