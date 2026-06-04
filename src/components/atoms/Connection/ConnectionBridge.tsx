import { cn } from "../../../lib/cn";

export type ConnectionBridgeVariant = "not-connected" | "connected";

export type ConnectionBridgeProps = {
  variant?: ConnectionBridgeVariant;
  className?: string;
};

export type AnimatedConnectionBridgeProps = {
  connected?: boolean;
  flipped?: boolean;
  className?: string;
};

/** Wide bridge connector for showing whether adjacent flow sections are connected. */
export function ConnectionBridge({
  variant = "not-connected",
  className,
}: ConnectionBridgeProps) {
  if (variant === "connected") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="79"
        height="30"
        fill="none"
        className={cn("block", className)}
        aria-label="Connected bridge"
      >
        <path
          fill="#2563eb"
          d="M79 0H60.21a15 15 0 0 0-11.714 24.37l.951 1.19a11.83 11.83 0 0 0 9.24 4.44H79 0h19.313c3.595 0 6.994-1.634 9.24-4.44l.95-1.19A15 15 0 0 0 17.792 0H0z"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="79"
      height="40"
      fill="none"
      className={cn("block", className)}
      aria-label="Not connected bridge"
    >
      <path
        fill="#2563eb"
        d="M43 36.5a6.95 6.95 0 0 0 6.031 3.5H79 0h28.969A6.95 6.95 0 0 0 35 36.5l1.008-1.764a3.446 3.446 0 0 1 5.984 0z"
      />
      <path
        fill="#fff"
        d="M41.5 27.5a2.5 2.5 0 0 1-5 0v-2a2.5 2.5 0 0 1 5 0zM79 0H58.149a10 10 0 0 0-8.587 4.875l-6.269 10.503c-1.94 3.25-6.647 3.25-8.586 0l-6.27-10.503A10 10 0 0 0 19.852 0H0z"
      />
    </svg>
  );
}

/**
 * Crossfades between wide bridge variants for smoother state changes.
 * Keeps both SVGs mounted so opacity/transform can animate.
 */
export function AnimatedConnectionBridge({
  connected = false,
  flipped = false,
  className,
}: AnimatedConnectionBridgeProps) {
  return (
    <div
      className={cn(
        "relative h-full w-[79px]",
        flipped && "rotate-180",
        className,
      )}
      aria-hidden
    >
      <ConnectionBridge
        variant="not-connected"
        className={cn(
          "absolute left-0 top-0 origin-top transition-[opacity,transform] duration-[220ms] ease-out motion-reduce:transition-none",
          connected
            ? "opacity-0 -translate-y-1 scale-[0.97]"
            : "opacity-100 translate-y-0 scale-100",
        )}
      />
      <ConnectionBridge
        variant="connected"
        className={cn(
          "absolute left-0 top-0 origin-top transition-[opacity,transform] duration-[220ms] ease-out motion-reduce:transition-none",
          connected
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-1 scale-[0.97]",
        )}
      />
    </div>
  );
}
