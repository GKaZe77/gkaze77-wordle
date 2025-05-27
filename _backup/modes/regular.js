// === Regular Mode Logic ===
// Classic Wordle with hourly shared seed logic per player

import { renderBoard } from '../components/board.js';
import { renderKeyboard, updateKeyColors } from '../components/keyboard.js';
import { renderEndScreen } from '../components/endscreen.js';
import { evaluateGuess } from '../components/feedback.js';
import { getSeedMetadata } from '../utils/seed.js';
import { getState, setState } from '../utils/state.js';

const MAX_GUESSES = 6;
const STORAGE_KEY_PREFIX = 'wordle-regular';

let wordList = [];
let wordToGuess = '';
let guesses = [];
let feedbacks = [];
let mode = 'seed';
let seedKey = '';

// === Init ===
async function init() {
  wordList = await fetch('../data/wordlist.json').then(res => res.json());

  const { word, key } = getSeedMetadata(wordList, 'regular');
  seedKey = key;

  const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY_PREFIX}-${key}`) || '{}');

  if (saved.word && saved.guesses && saved.feedbacks) {
    wordToGuess = saved.word;
    guesses = saved.guesses;
    feedbacks = saved.feedbacks;
    mode = saved.mode || 'seed';
  } else if (Date.now() % 3600000 < 3000) {
    // edge-case: just crossed the hour, seed might not be ready
    wordToGuess = word;
    guesses = [''];
    feedbacks = [];
    mode = 'seed';
    saveProgress();
  } else {
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
  setState({ wordToGuess, guesses, feedbacks });
}

function updateKeyboardFromSavedGuesses() {
  for (let i = 0; i < feedbacks.length; i++) {
    if (feedbacks[i]?.length === 5) {
      updateKeyColors(feedbacks[i], guesses[i]);
    }
  }
}

function shakeRow(index) {
  const row = document.querySelectorAll('.guess-row')[index];
  if (row) {
    row.classList.add('shake');
    setTimeout(() => row.classList.remove('shake'), 600);
  }
}

// === Save State to Local Storage ===
function saveProgress() {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}-${seedKey}`, JSON.stringify({
    word: wordToGuess,
    guesses,
    feedbacks,
    mode
  }));
}

// === Handle Keyboard Input ===
function onKeyPress(letter) {
  const currentIndex = guesses.length - 1;
  let currentGuess = guesses[currentIndex] || '';
  if (feedbacks[currentIndex]) return;

  if (letter === 'ENTER') {
    if (currentGuess.length !== 5) return;
    if (!wordList.includes(currentGuess.toLowerCase())) {
		shakeRow(currentIndex);
		return;
	}

    const result = evaluateGuess(currentGuess, wordToGuess);
    feedbacks[currentIndex] = result;
    updateKeyColors(result, currentGuess);
    renderBoard(MAX_GUESSES, guesses, feedbacks, currentIndex);
    saveProgress();

    const isCorrect = currentGuess === wordToGuess;
    const gameOver = isCorrect || guesses.length >= MAX_GUESSES;

    if (gameOver) {
      renderEndScreen(isCorrect, wordToGuess, startFreshGame);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}-${seedKey}`);
    } else {
      guesses[currentIndex] = currentGuess;
      guesses.push('');
    }

    setState({ guesses, feedbacks });

  } else if (letter === '⌫') {
    guesses[currentIndex] = currentGuess.slice(0, -1);
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  } else if (/^[A-Z]$/.test(letter) && currentGuess.length < 5) {
    guesses[currentIndex] = currentGuess + letter;
    renderBoard(MAX_GUESSES, guesses, feedbacks);
  }
}

// === Update Page Title ===
function updateTitle() {
  const title = document.getElementById('game-title');
  if (!title) return;

  title.textContent = mode === 'seed' ? '🟩 Seed Wordle' : '🟩 Random Wordle';
  title.title = mode === 'seed'
    ? `Seed: ${seedKey}\nSame word for all players this hour.`
    : `Session: Random word\nUnique to your session.`;
}


// === Countdown Timer ===
function startCountdown() {
  const el = document.getElementById('timer');
  if (!el) return;

  function update() {
    const ms = 3600000 - (Date.now() % 3600000);
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    el.textContent = `⏱ Next word in ${m}:${s.toString().padStart(2, '0')}`;
  }

  update();
  setInterval(update, 1000);
}

// === Manual Reset Button ===
document.getElementById('reset-button')?.addEventListener('click', startFreshGame);

// === Fresh Game Logic (Play Again) ===
function startFreshGame() {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}-${seedKey}`);
  location.reload();
}

window.onload = init;
