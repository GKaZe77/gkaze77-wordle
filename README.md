# 🧠 GKaZe77 Wordle Clone

A custom multi-mode Wordle game featuring synchronized seed-based puzzles, deceptive logic twists, and reverse deduction challenges — all playable directly in the browser.

---

## 🎮 Game Modes

### 🟩 Regular Mode
- Classic 5-letter Wordle
- 6 guesses
- Standard feedback:
  - 🟩 correct letter, correct spot  
  - 🟨 correct letter, wrong spot  
  - ⬜️ letter not in the word  
- Global seed rotates **hourly** (UTC)
- Identical word for all players each hour

### 🧪 Corrupted Mode
- Same structure as Regular Mode
- But... feedback may **lie**:
  - Some ⬜️ are false
  - 🟨 or 🟩 may be omitted
- Visuals "glitch" randomly
- Unique seed per hour, separate from Regular

### 📐 Blueprint Mode
- You’re shown the final guess and feedback result
- Your goal: deduce the original hidden word  
- Logic puzzle format (not trial-and-error)
- AI-generated, solvable boards
- New challenge every hour (seeded)

---

## 🧠 Core Features

- 🎯 Shared word of the hour across all players
- 📤 Create and share **custom challenges**
- 📱 Mobile-friendly UI
- 💾 Saves in-progress games per mode
- 📚 Word definitions shown on game over
- 🔁 Reset or play again anytime
- 🧩 Future support for difficulty variants

---

## 🌐 Public API

Available at: **https://api.gkaze77.com**

### Endpoints

| Endpoint                              | Description                             |
|---------------------------------------|-----------------------------------------|
| `/wordlist/general`                   | Get full guessable word list            |
| `/wordlist/validate?word=APPLE`       | Check if a word is valid                |
| `/wordlist/random`                    | Get a random word                       |
| `/wordlist/seed?mode=regular`         | Get current seed word for a mode        |
| `/wordlist/used?mode=&seed=`          | Check if a seed has been completed      |
| `/wordlist/mark-used` (POST)          | Mark a seed as used                     |
| `/wordlist/definition?word=CRANE`     | Get word definition                     |
| `/wordlist/custom?word=&mode=`        | Generate a sharable hash for a word     |
| `/wordlist/check-custom?hash=12345`   | Debug (reverse hash is lossy)           |

All words are **case-insensitive** and treated as uppercase.

---

## 🔐 MIT License

```text
MIT License

Copyright (c) 2025 Gabriel Zarate

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND...
