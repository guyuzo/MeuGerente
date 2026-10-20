import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "brand" | "danger" | "ghost" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-neutral-900 text-neutral-50 hover:bg-neutral-800 px-4 rounded-md",
  secondary: "bg-neutral-150 text-neutral-900 hover:bg-neutral-200 px-4 rounded-md",
  /** Lilás reservado pra ações de IA (gerar roteiro, montar cronograma, avaliar potencial). Texto sempre neutral-900, nunca branco. */
  brand: "bg-purple-400 text-neutral-900 hover:bg-purple-500 px-4 rounded-md",
  danger: "bg-error text-white hover:opacity-90 px-4 rounded-md",
  ghost: "bg-transparent text-neutral-600 hover:bg-neutral-150 px-4 rounded-md",
  icon: "bg-neutral-150 text-neutral-900 hover:bg-neutral-200 rounded-full w-10 h-10 justify-center",
};

/** Botão base do sistema. Reaproveitar sempre esta variante em vez de criar botão novo — ver CLAUDE.md. */
export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 h-10 text-body-strong font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
