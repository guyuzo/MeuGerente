import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "accent" | "blue";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-neutral-150 text-neutral-600",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  error: "bg-error-bg text-error",
  accent: "bg-purple-100 text-purple-700",
  blue: "bg-neutral-150 text-blue-700",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Pílula de status genérica. StatusPill (components/shared) monta em cima desta para cada entidade. */
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-sm text-caption font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
