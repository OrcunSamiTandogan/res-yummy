import { whatsappNumber } from "@/data/restaurant";

type WhatsAppButtonProps = {
  message?: string;
  className?: string;
  children: React.ReactNode;
};

export function WhatsAppButton({ message, className, children }: WhatsAppButtonProps) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  const href = `https://wa.me/${whatsappNumber}${text}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}