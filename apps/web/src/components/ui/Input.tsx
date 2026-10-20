import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const campoClasses =
  "w-full h-10 px-3 rounded-md bg-neutral-150 text-body text-neutral-900 placeholder:text-neutral-500 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="block text-caption text-neutral-600 mb-1" {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(campoClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(campoClasses, "h-auto min-h-24 py-2 resize-y", className)} {...props} />;
}

interface FieldProps {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}

/** Rótulo + campo, para não repetir a estrutura em todo form. */
export function Field({ label, htmlFor, className, children }: FieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
