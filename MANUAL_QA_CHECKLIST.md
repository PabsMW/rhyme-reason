# Manual QA — Rhyme & Reason

Run `npm run dev` and walk through on a ~390px-wide viewport.

- [ ] Fresh load → home shows title, subtitle, Play button
- [ ] Play → Level 1 round 1: 8-word cloud, 4 hints, guess input visible
- [ ] Wrong guess (e.g. `foo`) → error message, can retry
- [ ] Correct guess `MOLD` → advances to hint 2, first hint marked solved
- [ ] Complete Level 1 (MOLD, ROT, YEAST, CRUMB) → Level 2 with 4-word cloud from L1 answers
- [ ] Complete Level 2 (SPOIL, DOUGH) → Level 3 with 2-word cloud
- [ ] Complete Level 3 (STALE) → result screen lists all 7 solved words
- [ ] Play again → fresh run from Level 1
- [ ] Mobile ~390px: no horizontal scroll on play screen
- [ ] Enter key in guess field submits guess
- [ ] `/playground` (dev): atoms and molecules render

## Level 1 answers (seed fixture)

1. MOLD
2. ROT
3. YEAST
4. CRUMB
