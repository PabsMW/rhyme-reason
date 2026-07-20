# Rhyme & Reason — No Rails Mode Spec

> **Scope:** This document describes the **No Rails** solve flow with the **3-levels** win setting. It is the go-forward experience. Legacy flows (Sequential, Parallel, Parallel 2.0, Parallel 3.0) are intentionally excluded. Note: the codebase default flow is still `sequential`; No Rails is what we're building toward.

## 1. Overview

Rhyme & Reason is a word-association puzzle game. The player is shown a **clue** and a **cloud of words**. To solve a clue they must supply three things:

- **Reason** — a word dragged from the cloud that *connects* to the clue.
- **Answer** — the target word, typed in.
- **Rhyme** — a word dragged from the cloud that *rhymes* with the typed answer.

The twist that ties the game together: **each level's answers become the next level's word cloud**, so solving early clues feeds the words you need later.

## 2. Core mechanic

For a single clue the player produces three values:

| Piece | How it's entered | Correct when… |
|---|---|---|
| Reason | Drag a cloud word into the "Reason" zone | It matches the clue's connecting word |
| Answer | Type into the answer input | It matches the clue's answer |
| Rhyme | Drag a cloud word into the "Rhymes with" zone | It rhymes with the answer |

Rules:
- Matching is **case-insensitive** and trims whitespace.
- The **Reason word and Rhyme word must be different**.
- The three pieces can be filled in **any order**.

## 3. Levels & the "Levels to Win" setting

The game supports winning after **1, 2, or 3 levels**. This spec assumes **3 levels**.

The 3-level chain works like this (using the Easy puzzle as an example):

- **Level 1** — 4 clues. Word cloud is an authored list of ~8 words.
- **Level 2** — 2 clues. Word cloud = **the answers from Level 1**.
- **Level 3** — 1 clue. Word cloud = **the answers from Level 2**.

You **win** by solving every clue on every level up through the chosen level. Header displays `Level X of 3`. Changing the levels setting **resets the run**.

There is **no lose condition** — the player has unlimited attempts and can always fall back on Hint / Give Up.

## 4. Screens

### Home
- Shows the puzzle title and a settings summary (e.g. `Easy : No Rails : 3 levels`).
- **Play** button: goes to the tutorial on first visit (or if "always show tutorial" is on), otherwise straight to the game.

### Tutorial (How to Play)
A short guided walkthrough ending in a hands-on practice clue. See §6.

### Game screen
- **Header:** `Level X of 3`, a `CHECKS: N` counter, and a Home button.
- **Word cloud:** the draggable words available for the current level.
- **Clue cards:** one card per clue, with a prompt to "Tap any clue to solve." Solved cards show a check badge and a small celebration.
- Tapping an unsolved clue opens the **Guess Modal**.

### Guess Modal (the solve surface)
- **Header:** `Clue N`, the `CHECKS: N` counter, and a Close button.
- **Body:** the word cloud plus the clue panel (clue text → Reason drop zone → Answer input with a "Rhymes with" drop zone).
- **Footer:** a **Hint / Give Up** button (left) and a **Check** button (right). Check is enabled as soon as any field has content.

### Result screen
- "You did it!" celebration.
- A summary of all answer words solved across the levels, shown as chips.
- Buttons to start another puzzle (Easy / Medium / Hard).

## 5. No Rails rules & gameplay

The defining trait of No Rails is **deferred validation** — the player can freely place any words and type anything; nothing is judged until they press **Check**.

### The Check button
When **Check** is pressed, the three pieces are evaluated top to bottom (Reason → Answer → Rhyme):

- **Empty field** → that zone/input gives a shake cue; nothing is locked.
- **Wrong Reason or Rhyme word** → a rejection animation plays and the tile flies back to the cloud; the field clears.
- **Wrong typed Answer** → a "Wrong answer" message and the input shakes; the typed text stays so the player can edit it.
- **Correct-but-incomplete** → each correct field **locks** into a green chip and stays locked while the player works on the rest.
- **All three correct** → a staggered success reveal (Reason, then Answer, then Rhyme) plays, then the modal closes and the clue is marked solved.

### Scoring — "CHECKS"
The counter is labeled **CHECKS** (rather than "moves"). Every Check press that doesn't fully solve the clue increments it, and the final solving Check counts too. Lower is better. Hints do **not** increment it.

### Hint / Give Up
A single button that adapts to what's missing, in this priority order:

1. No Reason yet → **places the correct Reason word**.
2. No Rhyme yet → **places the correct Rhyme word**.
3. Answer missing or wrong first letter → **fills in the first letter**.
4. Answer still wrong → button becomes **"Give Up"** and **reveals the full answer**.

### After a clue is solved
- The solved clue card celebrates.
- The Reason and Rhyme words that were used are removed from the active cloud.
- When all clues on a level are solved, the game auto-advances to the next level (solved-answer history is retained). After the final level, the run is **won** and navigates to the Result screen.

## 6. No Rails Tutorial

The tutorial is a linear walkthrough of one demo clue, followed by a hands-on practice clue that uses the *real* No Rails Check logic.

- **Demo clue** (guided, steps 1–6): Clue *"A breed of big dog"* — cloud words **GREAT** and **LANE**; Reason = GREAT, Answer = **DANE**, Rhyme = LANE. These steps use immediate step-by-step validation to teach the mechanic.
- **Practice clue** (step 7): Clue *"The highest prize at the Olympics"* — cloud words **GOLD** and **PEDAL**; Reason = GOLD, Answer = **MEDAL**, Rhyme = PEDAL. This screen behaves exactly like the real game: free placement, a **Check** button, and a **Hint** button. On full success it plays the staggered reveal and advances to the final "Solve all clues to win!" step.
- **Finish:** the tutorial routes into the game. A first-completion flag is stored so returning players skip the tutorial unless "always show tutorial" is enabled.

## 7. Data model

The essential shapes another agent needs to rebuild the game:

```ts
type HintDefinition = {
  id: string;
  clueText: string;
  anchorCloudWord: string; // the "Reason" word
  rhymeWith: string;       // the "Rhyme" word
};

type LevelDefinition = {
  level: 1 | 2 | 3;
  authoredCloudWords?: string[]; // Level 1 only
  hints: HintDefinition[];
  answers: string[];             // answers[i] pairs with hints[i]
};

type GameDefinition = {
  id: string;
  title: string;
  subtitle: string;
  levels: LevelDefinition[];
};

type ClueSubmission = { answer: string; connect: string; rhyme: string };

type RunState = {
  gameId: string;
  level: 1 | 2 | 3;
  solvedHintIds: string[];
  solvedAnswers: string[];
  totalMoves: number;   // shown as "CHECKS" in No Rails
  status: "playing" | "won";
  levelsToWin: 1 | 2 | 3;
};

type GameSettings = {
  levelsToWin: 1 | 2 | 3;
  solveFlow: "no-rails" /* | legacy flows */;
  alwaysShowTutorial: boolean;
  puzzle: "easy" | "medium" | "hard";
};
```

See **§11 Puzzle reference** for the full Easy, Medium, and Hard puzzle content.

## 8. State & persistence

There is **no global store** (no Redux/Zustand). State is layered:

- **Settings** (levels, flow, tutorial, puzzle) live in the **URL** query params, e.g. `/play?levels=3&flow=no-rails&puzzle=easy`.
- **Run progress** (`RunState`) is saved to **`sessionStorage`**.
- **Onboarding completion** is stored in **`localStorage`**.
- The active solve UI (modal fields, drag state, tutorial step) is **local React state** and is ephemeral.

## 9. Full playthrough (No Rails, 3 levels, Easy)

1. Player starts a fresh run at Level 1 (3 levels + No Rails configured).
2. **Level 1 (4 clues):** For each clue, tap it, place Reason / type Answer / place Rhyme in any order, press **Check**. Correct pieces lock; wrong ones shake or fly back. Solving all 4 auto-advances to Level 2.
3. **Level 2 (2 clues):** The cloud is now Level 1's answers. Solve both.
4. **Level 3 (1 clue):** The cloud is Level 2's answers. Solve it → run is **won**.
5. **Result:** all solved answer words are shown across the 3 levels; the `CHECKS` total reflects how efficiently the player solved.

## 10. Puzzle reference

Source of truth: `src/data/puzzles.ts`. Three puzzles are available: `easy`, `medium`, `hard`. Each has 3 levels. Level 1 includes an authored word cloud; Levels 2 and 3 use the previous level's answers as the cloud.

### Easy (`puzzle-easy`)

**Level 1 cloud:** WHEEL, NARROW, BLUE, THREAD, OLIVE, PACKER, SHAKE, SLACK

| Clue | Reason | Answer | Rhyme |
|---|---|---|---|
| Device for moving your tools | WHEEL | barrow | NARROW |
| Two primary colors | BLUE | red | THREAD |
| Two things seen on a cheese board | OLIVE | cracker | PACKER |
| Place to grab a burger and fries | SHAKE | shack | SLACK |

**Level 2 cloud:** barrow, red, cracker, shack *(Level 1 answers)*

| Clue | Reason | Answer | Rhyme |
|---|---|---|---|
| Ball park delight | cracker | jack | shack |
| "No right turns" | red | arrow | barrow |

**Level 3 cloud:** jack, arrow *(Level 2 answers)*

| Clue | Reason | Answer | Rhyme |
|---|---|---|---|
| Captain of The Black Pearl | jack | sparrow | arrow |

**Full answer chain:** barrow → red → cracker → shack → jack → arrow → sparrow

---

### Medium (`puzzle-medium`)

**Level 1 cloud:** BASEBALL, SHOVE, DOCS, MOTION, COCKTAIL, TANK, AT, SPORTY

| Clue | Reason | Answer | Rhyme |
|---|---|---|---|
| Sleep on it to break it in | BASEBALL | glove | SHOVE |
| Competing writing programs | DOCS | notion | MOTION |
| The pig that goes in a blanket | COCKTAIL | frank | TANK |
| "Where life begins", or so it is said | AT | forty | SPORTY |

**Level 2 cloud:** glove, notion, frank, forty *(Level 1 answers)*

| Clue | Reason | Answer | Rhyme |
|---|---|---|---|
| Lopsided Tennis Score | forty | love | glove |
| Grammy winning R&B Artist | frank | ocean | notion |

**Level 3 cloud:** love, ocean *(Level 2 answers)*

| Clue | Reason | Answer | Rhyme |
|---|---|---|---|
| The Ancient Greeks used orchids and wine to make it | love | potion | ocean |

**Full answer chain:** glove → notion → frank → forty → love → ocean → potion

---

### Hard (`puzzle-hard`)

**Level 1 cloud:** SEA, MASS, MOOSE, STACKS, REACH, CARS, SERENA, GENUS

| Clue | Reason | Answer | Rhyme |
|---|---|---|---|
| Branzino | SEA | bass | MASS |
| Ice cream choice, or something you might find on the ground | MOOSE | tracks | STACKS |
| Do one for the other | REACH | stars | CARS |
| Sisters | SERENA | venus | GENUS |

**Level 2 cloud:** bass, tracks, stars, venus *(Level 1 answers)*

| Clue | Reason | Answer | Rhyme |
|---|---|---|---|
| Two of eight | venus | mars | stars |
| You might see them together at a concert | bass | sax | tracks |

**Level 3 cloud:** mars, sax *(Level 2 answers)*

| Clue | Reason | Answer | Rhyme |
|---|---|---|---|
| War and Peace | mars | pax | sax |

**Full answer chain:** bass → tracks → stars → venus → mars → sax → pax

## 11. Component / file index (for rebuilders)

| Area | Location |
|---|---|
| Main game screen | `src/pages/GamePage.tsx` |
| Tutorial | `src/pages/HowToPlayPage.tsx` |
| Home / routing | `src/pages/HomePage.tsx` |
| Result | `src/pages/ResultPage.tsx` |
| Solve modal (No Rails logic) | `src/components/molecules/GuessModal/GuessModal.tsx` |
| Clue panel | `src/components/molecules/ClueWordFlowPanel/ClueWordFlowPanel.tsx` |
| Answer + rhyme input | `src/components/molecules/RhymesInputDropZone/` |
| Reason drop zone | `src/components/molecules/SimpleWordDropZone/` |
| Core types + validation | `src/data/game.ts` |
| Puzzle content | `src/data/puzzles.ts` |
| Run persistence / win logic | `src/lib/gameRun.ts` |
| Settings (URL layer) | `src/lib/gameSettings.ts` |
| Hint action logic | `src/lib/noRailsSolve.ts` |
