import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Text } from "../components/atoms/Text";
import {
  borderColors,
  feedbackColors,
  fontFamilies,
  levelColors,
  shadows,
  surfaceColors,
  textColors,
  textVariants,
  wordcloudtileColors,
  wordinputColors,
  type ColorToken,
} from "../data/designTokens";
import { WordCloudTile } from "../components/atoms/WordCloudTile";
import { cn } from "../lib/cn";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <Text as="h2" variant="subtitle">
        {title}
      </Text>
      {children}
    </section>
  );
}

function ColorSwatch({ token }: { token: ColorToken }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("h-16 w-full rounded-xl border border-game-border-surface-level2", token.className)} />
      <div>
        <p className="font-inter text-sm font-medium text-game-text-base-primary">{token.name}</p>
        <p className="font-inter text-xs text-game-text-base-tertiary">{token.hex}</p>
        <p className="mt-0.5 font-mono text-xs text-game-text-base-tertiary">{token.className}</p>
      </div>
    </div>
  );
}

function BorderSwatch({ token }: { token: ColorToken }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex h-16 w-full items-center justify-center rounded-xl border-2 bg-game-surface-base-level2",
          token.className,
        )}
      >
        <span className="font-inter text-xs text-game-text-base-tertiary">2px border</span>
      </div>
      <div>
        <p className="font-inter text-sm font-medium text-game-text-base-primary">{token.name}</p>
        <p className="font-inter text-xs text-game-text-base-tertiary">{token.hex}</p>
        <p className="mt-0.5 font-mono text-xs text-game-text-base-tertiary">{token.className}</p>
      </div>
    </div>
  );
}

function TextColorSample({ token }: { token: ColorToken }) {
  const onWordInputDefault = token.className === "text-game-text-component-wordinput-default";
  const onDark =
    token.className === "text-game-text-inverse" || onWordInputDefault;

  return (
    <div
      className={cn(
        "rounded-xl border border-game-border-surface-level2 p-4",
        onWordInputDefault
          ? "bg-game-surface-component-wordinput-default"
          : onDark
            ? "bg-game-surface-action-primary-default"
            : "bg-game-surface-base-level1",
      )}
    >
      <p className={cn("font-inter text-lg", token.className)}>
        The quick brown fox jumps over the lazy dog.
      </p>
      <p className="mt-2 font-inter text-xs text-game-text-base-tertiary">
        {token.name} · {token.hex}
      </p>
      <p className="font-mono text-xs text-game-text-base-tertiary">{token.className}</p>
    </div>
  );
}

export function StyleGuidePage() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Text as="h1" variant="title">
          Style guide
        </Text>
        <Text variant="body">
          Design tokens from <code className="font-mono text-sm">tailwind.config.js</code> used
          across the game UI.
        </Text>
        <Link to="/" className="w-fit font-inter text-sm text-game-text-base-tertiary underline">
          Back to home
        </Link>
      </header>

      <Section title="Surface colors">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surfaceColors.map((token) => (
            <ColorSwatch key={token.className} token={token} />
          ))}
        </div>
      </Section>

      <Section title="Text colors">
        <div className="grid gap-4 sm:grid-cols-2">
          {textColors.map((token) => (
            <TextColorSample key={token.className} token={token} />
          ))}
        </div>
      </Section>

      <Section title="Border colors">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {borderColors.map((token) => (
            <BorderSwatch key={token.className} token={token} />
          ))}
        </div>
      </Section>

      <Section title="Level accents">
        <div className="grid gap-4 sm:grid-cols-3">
          {levelColors.map((token) => (
            <ColorSwatch key={token.className} token={token} />
          ))}
        </div>
      </Section>

      <Section title="Feedback">
        <div className="grid gap-4 sm:grid-cols-2">
          {feedbackColors.map((token) => (
            <ColorSwatch key={token.className} token={token} />
          ))}
        </div>
      </Section>

      <Section title="Word input (guess section)">
        <div className="grid gap-4 sm:grid-cols-2">
          {wordinputColors.map((token) =>
            token.className.startsWith("border-") ? (
              <BorderSwatch key={token.className} token={token} />
            ) : token.className.startsWith("text-") ? (
              <TextColorSample key={token.className} token={token} />
            ) : (
              <ColorSwatch key={token.className} token={token} />
            ),
          )}
        </div>
      </Section>

      <Section title="Word cloud tile">
        <div className="grid gap-4 sm:grid-cols-2">
          {wordcloudtileColors.map((token) =>
            token.className.startsWith("border-") ? (
              <BorderSwatch key={token.className} token={token} />
            ) : token.className.startsWith("text-") ? (
              <TextColorSample key={token.className} token={token} />
            ) : (
              <ColorSwatch key={token.className} token={token} />
            ),
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <WordCloudTile word="bacteria" variant="highlighted" />
          <WordCloudTile word="MOLD" variant="solved" />
          <WordCloudTile word="kitchen" />
          <WordCloudTile word="scold" variant="ghost" />
        </div>
      </Section>

      <Section title="Font families">
        <div className="flex flex-col gap-4">
          {fontFamilies.map((font) => (
            <div
              key={font.className}
              className="rounded-xl border border-game-border-surface-level2 bg-game-surface-base-level1 p-4"
            >
              <p className={cn("text-2xl", font.className)}>{font.sample}</p>
              <p className="mt-2 font-inter text-sm text-game-text-base-tertiary">
                {font.name} · <span className="font-mono">{font.className}</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Text variants">
        <div className="flex flex-col gap-4 rounded-xl border border-game-border-surface-level2 bg-game-surface-base-level1 p-4">
          {textVariants.map((variant) => (
            <div key={variant.name} className="border-b border-game-border-surface-level1 pb-4 last:border-0 last:pb-0">
              <p className={variant.className}>{variant.name}</p>
              <p className="mt-1 font-mono text-xs text-game-text-base-tertiary">{variant.className}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shadows">
        <div className="grid gap-4 sm:grid-cols-2">
          {shadows.map((shadow) => (
            <div
              key={shadow.className}
              className={cn(
                "flex h-24 items-center justify-center rounded-xl bg-game-surface-base-level2",
                shadow.className,
              )}
            >
              <span className="font-inter text-sm text-game-text-base-secondary">{shadow.name}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
