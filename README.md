# WordleGameProject

An advanced multi-mode Wordle clone with seed-based word-of-the-hour logic. Each mode generates its own unique word every hour, synchronized across all players.

---

## 🎮 Game Modes

- 🟩 **Regular Mode**  
  Classic 5-letter Wordle. Guess the hidden word in 6 tries using green/yellow/gray feedback.  
  Seeded word rotates every hour and is the same for all players.

- 🧪 **Corrupted Mode**  
  Same gameplay as Regular, but the feedback can lie. Some ⬜️ may actually be 🟩 or 🟨.  
  Adds paranoia and bluff-logic. Themed visuals and randomized deception logic.  
  Uses its own hourly seed.

- 🔁 **Reverse Mode**  
  You see a final guess and the feedback result. Your job: figure out the hidden word that caused it.  
  A logic puzzle mode. Requires analytical deduction. Also seeded uniquely every hour.

---

## 🧠 Seed Logic

- Based on a fixed epoch: `2025-01-01T00:00:00Z`
- One seed per hour: `Math.floor((now - epoch) / 3600000)`
- Each gamemode uses its own unique key:  
  Format: `"<mode>-wordle-<hour_number>"`

Example:
```js
getSeedMetadata(wordList, 'corrupted')
→ word: "SHARD", key: "corrupted-wordle-1443"
```

---

## 🧩 Word List

- You must use the exact same `wordlist.json` as others for the seed to match
- The list is pre-shuffled and fixed
- Store it locally or serve from a CDN

---

## 💾 Save Behavior

- Games are saved locally per-mode, per-hour
- If a saved game exists, it resumes until completed or reset
- Players can reset anytime using the "Reset Game" button

---

## 🌐 Deployment

- Works offline via static hosting (e.g. IIS, GitHub Pages)
- Designed to be portable to any domain

---

## 📁 Project Structure

```
modes/
  regular.html / regular.js
  corrupted.html / corrupted.js
  reverse.html / reverse.js

components/
  board.js, keyboard.js, feedback.js, endscreen.js

utils/
  seed.js, state.js, dom.js, storage.js

data/
  wordlist.json, word_definitions.js

css/
  game.css, corrupted.css, reverse.css
```

---

## ✅ License

MIT — Use freely, credit appreciated.
