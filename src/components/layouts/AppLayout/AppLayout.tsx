import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-dvh bg-game-surface-base-level0 text-game-text-base-primary">
      <main className="mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-12">{children}</main>
    </div>
  );
}
