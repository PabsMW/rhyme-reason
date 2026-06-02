import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span" | "h1" | "h2";
  variant?: "title" | "subtitle" | "body" | "label" | "caption";
  children: ReactNode;
};

const variantClass: Record<NonNullable<TextProps["variant"]>, string> = {
  title: "font-archivo text-4xl leading-none text-game-text-base-primary",
  subtitle: "font-archivo text-2xl leading-tight text-game-text-base-secondary",
  body: "font-inter text-base leading-relaxed text-game-text-base-primary",
  label: "font-sf-pro text-sm font-extrabold uppercase tracking-wide text-game-text-base-tertiary",
  caption: "font-inter text-sm text-game-text-base-tertiary",
};

export function Text({
  as: Tag = "p",
  variant = "body",
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Tag className={cn(variantClass[variant], className)} {...rest}>
      {children}
    </Tag>
  );
}
