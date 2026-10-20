import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/** Tabela padrão. Em telas estreitas rola só na horizontal dentro do container, nunca a página inteira. */
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className={cn("w-full text-left border-collapse", className)} {...props} />
    </div>
  );
}

export function Thead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function Tbody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-neutral-200 last:border-0", className)} {...props} />;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("py-3 pr-4 text-caption text-neutral-600 font-normal whitespace-nowrap", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("py-3 pr-4 text-body text-neutral-900 align-middle", className)} {...props} />;
}
