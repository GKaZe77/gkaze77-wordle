// components/feedback.js

export function evaluateGuess(guess, word) {
  const feedback = Array(5).fill('⬜️');
  const used = Array(5).fill(false);

  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) {
      feedback[i] = '🟩';
      used[i] = true;
    }
  }

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
