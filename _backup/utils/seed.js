// utils/seed.js
// Central seed word generator per mode per hour

export function getSeedMetadata(wordList, mode = 'regular') {
  const seedStart = new Date('2025-01-01T00:00:00Z');
  const now = new Date();
  const hoursPassed = Math.floor((now - seedStart) / (1000 * 60 * 60));
  const seedKey = `${mode}-wordle-${hoursPassed}`;
  const hash = simpleHash(seedKey);
  const index = hash % wordList.length;

  return {
    word: wordList[index].toUpperCase(),
    index,
    key: seedKey,
    timestamp: now,
    hoursPassed
  };
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
