# Rhyme & Reason

Word-association guessing prototype: hints + word cloud, three levels, carry-forward clouds.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3
- react-router-dom
- framer-motion (installed; use on result/polish later)

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Routes

| Path | Screen |
|------|--------|
| `/` | Home |
| `/hello` | Hello World — stack & deploy connectivity |
| `/play` | Game (3 levels) |
| `/result` | Win screen |
| `/playground` | Dev component playground |

## GitHub

https://github.com/PabsMW/rhyme-reason

## Vercel

Production: **https://rhyme-reason-phi.vercel.app**

Hello World check: **https://rhyme-reason-phi.vercel.app/hello**

GitHub is connected for automatic deploys on push to `main`. SPA routing is in `vercel.json`.

## Content

Puzzles live in `src/data/game.ts`. Run logic: `src/lib/gameRun.ts` (sessionStorage).

## QA

See [MANUAL_QA_CHECKLIST.md](./MANUAL_QA_CHECKLIST.md).
