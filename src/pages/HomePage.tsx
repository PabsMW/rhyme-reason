import { useEffect, useRef, useState } from "react";
import { FaGear } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { SEED_GAME } from "../data/game";
import { clearRun } from "../lib/gameRun";
import { cn } from "../lib/cn";
import { parseGameSettings, pathWithGameSettings } from "../lib/gameSettings";

type SettingsLink = {
  label: string;
  to: string;
};

const SETTINGS_LINKS: SettingsLink[] = [
  { label: "Game settings", to: "/settings" },
  { label: "Connectivity Check", to: "/hello" },
  ...(import.meta.env.DEV
    ? [
        { label: "Components", to: "/playground" },
        { label: "Style guide", to: "/style-guide" },
      ]
    : []),
];

function HomeSettingsMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameSettings = parseGameSettings(searchParams.toString());
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const goTo = (to: string) => {
    setOpen(false);
    const path = to === "/settings" ? pathWithGameSettings(to, gameSettings) : to;
    navigate(path);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full text-game-text-base-secondary transition-colors",
          "hover:bg-game-surface-base-level1 hover:text-game-text-base-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-border-action-primary-hover focus-visible:ring-offset-2",
          open && "bg-game-surface-base-level1 text-game-text-base-primary",
        )}
      >
        <FaGear className="size-5" aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-[200px] overflow-hidden rounded-xl border border-game-border-surface-level2 bg-game-surface-base-level2 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {SETTINGS_LINKS.map((link) => (
            <button
              key={link.to}
              type="button"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left font-inter text-sm text-game-text-base-primary transition-colors hover:bg-game-surface-base-level1"
              onClick={() => goTo(link.to)}
            >
              {link.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameSettings = parseGameSettings(searchParams.toString());

  const handlePlay = () => {
    clearRun();
    navigate(pathWithGameSettings("/play", gameSettings));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <div className="mx-auto flex w-full max-w-[540px] justify-end px-4 pt-4">
        <HomeSettingsMenu />
      </div>
      <div className="mx-auto flex w-full max-w-[540px] flex-1 flex-col items-center justify-center px-4 pb-10 text-center">
        <Text as="h1" variant="title">
          {SEED_GAME.title}
        </Text>
        <Button
          variant="primary"
          size="lg"
          type="button"
          className="mt-10 min-w-[280px]"
          onClick={handlePlay}
        >
          Play
        </Button>
      </div>
    </div>
  );
}
