import type { Site } from "./types";

/** wa.me link with a short opening line, or null when no WhatsApp number is set. */
export function whatsappUrl(site: Site, text = "Hi Durbin Films, I would like to talk about a project."): string | null {
  const digits = (site.whatsapp || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
