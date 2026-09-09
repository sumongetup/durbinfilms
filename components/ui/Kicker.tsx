import type { ReactNode } from "react";

export function Kicker({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <span className={`kicker ${className}`.trim()} id={id}>
      {children}
    </span>
  );
}
