import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "ghost";

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

type AnchorProps = BaseProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;
type NativeButtonProps = BaseProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

/**
 * The prototype's `.btn` in its two flavours. Renders a Next <Link> for
 * internal routes, a plain <a> for mailto/tel/external, or a <button>.
 */
export function Button({ variant = "primary", className = "", children, ...rest }: AnchorProps | NativeButtonProps) {
  const cls = `btn btn-${variant} ${className}`.trim();

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...anchor } = rest as AnchorProps;
    const props = anchor as ComponentPropsWithoutRef<"a">;
    if (/^(mailto:|tel:|https?:)/.test(href)) {
      return (
        <a className={cls} href={href} {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link className={cls} href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}
