import Image from "next/image";

/** Intrinsic size of public/images/brand/logo-nav.png, aspect 2.466. */
const W = 420;
const H = 170;

/**
 * The Durbin Films lockup, recoloured to the brand gradient by
 * `npm run logo`. Height is set by the caller; width follows the aspect.
 */
export function Logo({ height = 42, priority = false, className = "" }: { height?: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src="/images/brand/logo-nav.png"
      alt="Durbin Films"
      width={W}
      height={H}
      priority={priority}
      className={`logo-img ${className}`.trim()}
      style={{ height, width: "auto" }}
    />
  );
}
