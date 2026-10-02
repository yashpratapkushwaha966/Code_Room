export default function Footer() {
  return (
    <footer
      className="border-t border-ink/10 py-8 text-center text-sm text-ink/60"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
    >
      <p className="font-display font-semibold text-ink/80">
        Rent<span className="text-aqua">Near</span>Me
      </p>
      <p className="mt-1">Prototype build — mock data, ready to connect to a real backend.</p>
    </footer>
  );
}
