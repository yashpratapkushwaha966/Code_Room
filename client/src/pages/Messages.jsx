import { MessageCircle } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";

// Prototype inbox — no messaging backend/model exists yet. This page is the
// UI shell so the feature is visible and wireable later to a real
// Message model + /api/messages endpoints + a socket/polling layer.
export default function Messages() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold text-ink">Messages</h1>
      <p className="text-sm text-ink/60">Chat with owners and renters about a listing.</p>

      <div className="mt-8">
        <EmptyState
          title="No conversations yet"
          subtitle="When someone messages you about a property — or you message an owner — it'll show up here."
        />
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-dashed border-ink/15 bg-ink/5 px-4 py-3 text-xs text-ink/50">
        <MessageCircle size={14} />
        Prototype notice: this screen is ready to connect to a real messaging backend.
      </div>
    </div>
  );
}