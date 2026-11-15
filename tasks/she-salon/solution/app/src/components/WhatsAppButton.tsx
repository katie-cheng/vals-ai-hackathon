import { WHATSAPP_URL } from "../content";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message SHE Salon & Make-up Studio on WhatsApp"
      title="Message us on WhatsApp"
      className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-[#1f7a4d] text-white shadow-[0_6px_18px_rgba(22,18,15,0.25)] transition-colors duration-300 hover:bg-[#17603c] sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
