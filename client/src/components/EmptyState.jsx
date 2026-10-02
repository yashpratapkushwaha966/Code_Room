import { motion } from "framer-motion";

export default function EmptyState({ title, subtitle, actionLabel, onAction, secondaryLabel, onSecondary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center rounded-xl2 border border-dashed border-ink/15 bg-surface/70 px-6 py-14 text-center"
    >
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {subtitle && <p className="mt-1.5 max-w-sm text-sm text-ink/60">{subtitle}</p>}
      <div className="mt-5 flex gap-3">
        {onAction && (
          <button
            onClick={onAction}
            className="rounded-lg bg-aqua px-4 py-2 text-sm font-semibold text-paper hover:bg-aqua-light"
          >
            {actionLabel}
          </button>
        )}
        {onSecondary && (
          <button
            onClick={onSecondary}
            className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/70 hover:border-ink/30"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
