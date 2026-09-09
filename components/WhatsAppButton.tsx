import { whatsappUrl } from "@/lib/contact";
import type { Site } from "@/lib/types";

/** Fixed click-to-chat pill, bottom right. Renders nothing without a WhatsApp number. */
export function WhatsAppButton({ site }: { site: Site }) {
  const href = whatsappUrl(site);
  if (!href) return null;
  return (
    <a className="wa-fab" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with Durbin Films on WhatsApp">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-.9-1.1-1.2-1.7-.1-.2 0-.4.1-.5l.4-.5.2-.4c.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.6.6-.9 1.3-.9 2.1.1.9.4 1.7 1 2.5 1.1 1.6 2.5 2.8 4.2 3.6.5.2 1 .4 1.5.5.5.2 1 .1 1.5 0 .6-.2 1.1-.6 1.4-1.1.1-.3.2-.6.1-.9-.1-.1-.3-.2-.5-.3z" />
      </svg>
      <span>WhatsApp</span>
    </a>
  );
}
