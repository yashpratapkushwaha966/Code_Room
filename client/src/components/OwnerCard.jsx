import { Phone, MessageCircle, Star } from "lucide-react";

export default function OwnerCard({ owner }) {
  if (!owner) return null;

  return (
    <div className="rounded-xl2 border border-ink/10 bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/10 font-display font-semibold text-ink">
          {owner.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="font-display font-semibold text-ink">{owner.name}</p>
          <p className="text-xs text-ink/50">{owner.role}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-sm text-ink/70">
        {owner.rating != null && (
          <>
            <Star size={14} className="fill-aqua text-aqua" /> {owner.rating}
          </>
        )}
        {owner.responseTime && <span className="text-ink/40">{owner.rating != null ? "· " : ""}{owner.responseTime}</span>}
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={`tel:${owner.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-aqua hover:text-paper"
        >
          <Phone size={15} /> Call
        </a>
        {owner.whatsapp && (
          <a
            href={`https://wa.me/${owner.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sage/40 py-2.5 text-sm font-semibold text-sage hover:bg-sage/10"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
