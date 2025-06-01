import { renderBoard } from "../components/board.js";
import { renderKeyboard, updateKeyColors } from "../components/keyboard.js";
import { renderEndScreen } from "../components/endscreen.js";
import { evaluateGuess } from "../components/feedback.js";

const MAX_GUESSES = 6;
const STORAGE_KEY_PREFIX = 'wordle-corrupted';

let wordList = [];
let wordToGuess = '';
let guesses = [];
let feedbacks = [];
let mode = 'seed';
let seedKey = '';

async function init() {
  try {
    const res = await fetch('https://api.gkaze77.com/wordle/wordlist');
    wordList = await res.json();
  } catch {
    wordList = ['TRICK'];
  }

  try {
    const res = await fetch('https://api.gkaze77.com/wordle/seed?mode=corrupted');
    const data = await res.json();
    if (data?.word && data?.seed) {
      seedKey = data.seed;
      const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY_PREFIX}-${seedKey}`) || '{}');
      if (saved.word && saved.guesses && saved.feedbacks) {
        wordToGuess = saved.word;
        guesses = saved.guesses;
        feedbacks = saved.feedbacks;
        mode = saved.mode || 'seed';
      } else {
        wordToGuess = data.word.toUpperCase();
        guesses = [''];
        feedbacks = [];
        mode = 'seed';
        saveProgress();
      }
    }
  } catch {
    wordToGuess = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
    guesses = [''];
    feedbacks = [];
    mode = 'random';
  }

  renderBoard(MAX_GUESSES, guesses, feedbacks);
  updateKeyboardFromSavedGuesses();
  renderKeyboard(onKeyPress);
  updateTitle();
  startCountdown();
}

function updateKeyboardFromSavedGuesses() {
  for (let i = 0; i < feedbacks.length; i++) {
    if (feedbacks[i]?.length === 5) {
      updateKeyColors(feedbacks[i], guesses[i]);
    }
  }
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

function onKeyPress(letter) {
  const currentIndex = guesses.length - 1;
  let currentGuess = guesses[currentIndex] || '';
  if (feedbacks[currentIndex]) return;

  if (letter === 'ENTER') {
    if (currentGuess.length !== 5) return;
    if (!wordList.includes(currentGuess.toUpperCase())) return;

    currentGuess = currentGuess.toUpperCase();

    // GLITCHY logic override (deceptive feedback)
    const trueResult = evaluateGuess(currentGuess, wordToGuess);
    const glitchedResult = [...trueResult];

    // Add random glitch effect: sometimes hide one correct letter
    for (let i = 0; i < 5; i++) {
      if (Math.random() < 0.2) glitchedResult[i] = '⬜️';
    }

    feedbacks[currentIndex] = glitchedResult;
    updateKeyColors(glitchedResult, currentGuess);
    renderBoard(MAX_GUESSES, guesses, feedbacks, currentIndex);
    saveProgress();

    const isCorrect = currentGuess === wordToGuess;
    const gameOver = isCorrect || guesses.length >= MAX_GUESSES;

    if (gameOver) {
      renderEndScreen(isCorrect, wordToGuess, startFreshGame);
      if (seedKey) localStorage.removeItem(`${STORAGE_KEY_PREFIX}-${seedKey}`);
    } else {
      guesses[currentIndex] = currentGuess;
      guesses.push('');
    }
  } else if (letter === '⌫') {
    guesses[currentIndex] = currentGuess.slice(0, -1);
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  } else if (/^[A-Z]$/.test(letter) && currentGuess.length < 5) {
    guesses[currentIndex] = currentGuess + letter;
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  }
}

function updateTitle() {
  const title = document.getElementById('game-title');
  if (!title) return;
  title.textContent = mode === 'seed' ? '🧪 Corrupted Wordle (Seed)' : '🧪 Corrupted Wordle (Random)';
  title.title = mode === 'seed'
    ? `Seed: ${seedKey}\nFeedback may lie.`
    : `Random corrupted game.`
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
  if (seedKey) localStorage.removeItem(`${STORAGE_KEY_PREFIX}-${seedKey}`);
  location.reload();
}

document.getElementById('reset-button')?.addEventListener('click', startFreshGame);

window.addEventListener('keydown', (e) => {
  let key = e.key;
  if (key === 'Backspace') key = '⌫';
  else if (key === 'Enter') key = 'ENTER';
  else if (/^[a-zA-Z]$/.test(key)) key = key.toUpperCase();
  else return;
  onKeyPress(key);
});

window.onload = init;
