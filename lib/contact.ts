import { UI, type Locale } from "./i18n";
import type { Site } from "./types";

/** wa.me link with a short opening line, or null when no WhatsApp number is set. */
export function whatsappUrl(site: Site, locale: Locale = "en"): string | null {
  const digits = (site.whatsapp || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(UI[locale].whatsapp.text)}`;
}
