export function evaluateGuess(guess, target) {
  const feedback = Array(5).fill("⬜️");
  const guessLetters = guess.split("");
  const targetLetters = target.split("");

  const letterCounts = {};
  for (const letter of targetLetters) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }

  // First pass: Green (correct letter, correct spot)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      feedback[i] = "🟩";
      letterCounts[guessLetters[i]]--;
    }
  }

  // Second pass: Yellow (correct letter, wrong spot)
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