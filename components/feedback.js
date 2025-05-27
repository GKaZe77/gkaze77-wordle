// components/feedback.js
// Evaluates a 5-letter guess against the actual word
// Returns an array of 5 emoji codes: 🟩 correct, 🟨 wrong place, ⬜️ not in word

export function evaluateGuess(guess, word) {
  const feedback = Array(5).fill('⬜️');
  const used = Array(5).fill(false);

  // First pass: exact matches (green)
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) {
      feedback[i] = '🟩';
      used[i] = true;
    }
  }

  // Second pass: misplaced letters (yellow)
  for (let i = 0; i < 5; i++) {
    if (feedback[i] !== '⬜️') continue;

    for (let j = 0; j < 5; j++) {
      if (!used[j] && guess[i] === word[j]) {
        feedback[i] = '🟨';
        used[j] = true;
        break;
      }
    }
  }

  return feedback;
}
