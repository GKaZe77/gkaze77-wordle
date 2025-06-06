export function evaluateGuess(guess, target) {
  const feedback = Array(5).fill("⬜️");
  const targetLetters = target.split("");
  const used = Array(5).fill(false);

  // First pass: green (correct letter, correct spot)
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      feedback[i] = "🟩";
      used[i] = true;
    }
  }

  // Second pass: yellow (correct letter, wrong spot)
  for (let i = 0; i < 5; i++) {
    if (feedback[i] === "🟩") continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guess[i] === target[j]) {
        feedback[i] = "🟨";
        used[j] = true;
        break;
      }
    }
  }

  return feedback;
}
