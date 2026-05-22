import { Link } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { SEED_GAME } from "../data/game";

const GITHUB_REPO = "https://github.com/PabsMW/rhyme-reason";
const VERCEL_PRODUCTION = "https://rhyme-reason-phi.vercel.app";

type ConnectionCheck = {
  name: string;
  status: "ok" | "pending";
  detail: string;
};

function storageOk(): boolean {
  try {
    const key = "rhyme-reason-hello-check";
    sessionStorage.setItem(key, "1");
    sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function resolveDeployUrl(): string | null {
  if (import.meta.env.VITE_VERCEL_URL) {
    return `https://${import.meta.env.VITE_VERCEL_URL}`;
  }
  if (typeof window !== "undefined" && import.meta.env.PROD) {
    const { hostname, origin } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return origin;
    }
  }
  return null;
}

export function HelloWorldPage() {
  const deployUrl = resolveDeployUrl();

  const checks: ConnectionCheck[] = [
    { name: "React", status: "ok", detail: "Rendering this page" },
    { name: "TypeScript + Vite", status: "ok", detail: `Mode: ${import.meta.env.MODE}` },
    { name: "Tailwind CSS", status: "ok", detail: "game-* design tokens applied" },
    { name: "React Router", status: "ok", detail: "You are on /hello" },
    { name: "Game data", status: "ok", detail: `Loaded “${SEED_GAME.title}” (${SEED_GAME.levels.length} levels)` },
    {
      name: "Session storage",
      status: storageOk() ? "ok" : "pending",
      detail: storageOk() ? "Run state can persist" : "Unavailable in this browser",
    },
    {
      name: "GitHub",
      status: "ok",
      detail: "github.com/PabsMW/rhyme-reason",
    },
    {
      name: "Vercel",
      status: deployUrl ? "ok" : "pending",
      detail: deployUrl ?? "Deploy URL appears after first production build",
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <div className="mx-auto w-full max-w-[540px] flex-1 px-4 py-10">
        <Text as="h1" variant="title" className="text-center">
          Hello, World
        </Text>
        <Text variant="subtitle" className="mt-2 text-center">
          Rhyme & Reason — connectivity check
        </Text>

        <ul className="mt-8 flex flex-col gap-3">
          {checks.map((check) => (
            <li
              key={check.name}
              className="flex items-start gap-3 rounded-xl border border-game-border-surface-level2 bg-game-surface-base-level1 px-4 py-3"
            >
              <span
                className={
                  check.status === "ok"
                    ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-game-feedback-success/15 text-sm text-game-feedback-success"
                    : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-game-levels-2/30 text-sm text-game-text-base-secondary"
                }
                aria-hidden
              >
                {check.status === "ok" ? "✓" : "…"}
              </span>
              <div className="min-w-0">
                <p className="font-georgia text-lg font-semibold text-game-text-base-primary">
                  {check.name}
                </p>
                <p className="font-inter text-sm text-game-text-base-tertiary">{check.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/play" className="block w-full">
            <Button variant="primary" type="button" className="w-full">
              Play prototype
            </Button>
          </Link>
          <Link to="/" className="block w-full">
            <Button variant="secondary" type="button" className="w-full">
              Game home
            </Button>
          </Link>
        </div>

        <nav className="mt-8 flex flex-col gap-2 border-t border-game-border-surface-level1 pt-6 text-center font-inter text-sm">
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="text-game-text-base-secondary underline hover:text-game-text-base-primary"
          >
            GitHub repository
          </a>
          {deployUrl ? (
            <a
              href={deployUrl}
              target="_blank"
              rel="noreferrer"
              className="text-game-text-base-secondary underline hover:text-game-text-base-primary"
            >
              Production deploy
            </a>
          ) : (
            <a
              href={VERCEL_PRODUCTION}
              target="_blank"
              rel="noreferrer"
              className="text-game-text-base-secondary underline hover:text-game-text-base-primary"
            >
              Vercel production
            </a>
          )}
          {import.meta.env.DEV ? (
            <Link to="/playground" className="text-game-text-base-tertiary underline">
              Component playground
            </Link>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
