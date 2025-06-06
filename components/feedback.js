export function evaluateGuess(guess, target) {
  const feedback = Array(5).fill("⬜️");
  const targetLetters = target.split("");
  const guessLetters = guess.split("");

  const letterCounts = {};
  for (let c of targetLetters) {
    letterCounts[c] = (letterCounts[c] || 0) + 1;
  }

  // First pass: mark 🟩 and decrement counts
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      feedback[i] = "🟩";
      letterCounts[guessLetters[i]]--;
    }
  }

  // Second pass: mark 🟨 only if letter still available
  for (let i = 0; i < 5; i++) {
    if (feedback[i] === "🟩") continue;
    const letter = guessLetters[i];
    if (letterCounts[letter] > 0) {
      feedback[i] = "🟨";
      letterCounts[letter]--;
    }
  }

  return feedback;
}