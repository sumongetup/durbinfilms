import Image from "next/image";

/**
 * Full-bleed hero backdrop.
 *
 * The art is a 16:9 YouTube thumbnail. Filling a taller viewport with
 * `cover` crops a quarter off the sides and cuts the title lettering in
 * half, so the real frame is shown whole and a blurred, scaled copy of it
 * fills whatever the viewport aspect leaves over. Under 860px the frame
 * would be a thin band, so it goes back to `cover` there.
 */
export function Backdrop({ src, priority = false }: { src: string; priority?: boolean }) {
  return (
    <>
      <Image src={src} alt="" fill priority={priority} sizes="100vw" className="kb-blur" aria-hidden="true" />
      <Image src={src} alt="" fill priority={priority} sizes="100vw" className="kb-main" />
    </>
  );
}
