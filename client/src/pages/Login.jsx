import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

// `location.state.from` can be either a plain string ("/search?city=Gwalior")
// or a { pathname, search } object — normalise both into one path string.
function resolveRedirect(from) {
  if (!from) return "/dashboard";
  if (typeof from === "string") return from;
  return `${from.pathname || "/"}${from.search || ""}`;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectMessage = location.state?.message;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate(resolveRedirect(location.state?.from), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-8">
      <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/60">Log in to manage your listings and saved properties.</p>

      {redirectMessage && (
        <p className="mt-4 rounded-lg bg-aqua/10 px-3 py-2 text-sm text-ink/80">{redirectMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/50">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/50">Password</span>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none"
            placeholder="••••••••"
          />
        </label>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-ink py-3 text-sm font-semibold text-paper transition hover:bg-aqua hover:text-paper disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log in"}
        </motion.button>
      </form>

      <p className="mt-4 text-center text-sm text-ink/60">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-aqua">
          Create one
        </Link>
      </p>
    </div>
  );
}
