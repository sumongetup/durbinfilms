import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

/** Grid of 16:9 stills with the poster hover zoom and staggered reveal. */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  return (
    <ul className="gallery">
      {images.map((src, i) => (
        <Reveal as="li" className="still" key={src} delay={(i % 6) * 0.07}>
          <Image
            src={src}
            alt={`${title}, still ${i + 1}`}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            className="object-cover"
          />
        </Reveal>
      ))}
    </ul>
  );
}
