import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-8">
      <h1 className="font-display text-2xl font-bold text-ink">Create an account</h1>
      <p className="mt-1 text-sm text-ink/60">List properties and save your favorites across visits.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/50">Full name</span>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/50">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/50">Phone (optional)</span>
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/50">Password</span>
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none"
            placeholder="At least 8 characters"
          />
        </label>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-ink py-3 text-sm font-semibold text-paper transition hover:bg-aqua hover:text-paper disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </motion.button>
      </form>

      <p className="mt-4 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-aqua">
          Log in
        </Link>
      </p>
    </div>
  );
}
