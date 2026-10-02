import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Heart, LayoutDashboard, Home as HomeIcon, LogOut, ChevronDown, User, MessageCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/dashboard", label: "Profile", icon: LayoutDashboard },
];

export default function Navbar() {
  const [open, setOpen] = useState(false); // mobile menu
  const [profileOpen, setProfileOpen] = useState(false); // desktop profile dropdown
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Close the profile dropdown when clicking anywhere outside it.
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function requestLogout() {
    setProfileOpen(false);
    setOpen(false);
    setConfirmingLogout(true);
  }

  function confirmLogout() {
    logout();
    setConfirmingLogout(false);
    navigate("/");
  }

  const firstName = user?.name?.split(" ")[0] || "Account";

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Link to="/" className="font-display text-lg font-bold text-ink">
            Rent<span className="text-aqua">Near</span>Me
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-aqua" : "text-ink/70 hover:text-ink"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {user && (
              <Link
                to="/messages"
                className="rounded-full p-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                aria-label="Messages"
              >
                <MessageCircle size={18} />
              </Link>
            )}

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-ink/10 py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink/80 transition hover:border-ink/25"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                  {firstName}
                  <ChevronDown size={14} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-ink/10 bg-surface shadow-xl shadow-ink/10"
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="block border-b border-ink/10 px-4 py-3 hover:bg-ink/5"
                      >
                        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                        {user.email && <p className="truncate text-xs text-ink/50">{user.email}</p>}
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink/80 hover:bg-ink/5"
                      >
                        <LayoutDashboard size={15} /> My Profile
                      </Link>
                      <Link
                        to="/messages"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink/80 hover:bg-ink/5"
                      >
                        <MessageCircle size={15} /> Messages
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink/80 hover:bg-ink/5"
                      >
                        <Heart size={15} /> Favorites
                      </Link>
                      <button
                        onClick={requestLogout}
                        className="flex w-full items-center gap-2 border-t border-ink/10 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={15} /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-ink/70 hover:text-ink">
                Log in
              </Link>
            )}
          </nav>

          <button
            aria-label="Toggle menu"
            className="rounded-md p-2 text-ink md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-ink/10 md:hidden"
            >
              <div className="flex flex-col gap-1 px-5 py-3">
                {user && (
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="mb-1 flex items-center gap-2 rounded-lg bg-ink/5 px-3 py-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                      {user.email && <p className="truncate text-xs text-ink/50">{user.email}</p>}
                    </div>
                  </Link>
                )}

                {links.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                        isActive ? "bg-ink/5 text-aqua" : "text-ink/80"
                      }`
                    }
                  >
                    <Icon size={18} /> {label}
                  </NavLink>
                ))}
                {user && (
                  <Link
                    to="/messages"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-ink/80"
                  >
                    <MessageCircle size={18} /> Messages
                  </Link>
                )}
                {user ? (
                  <button
                    onClick={requestLogout}
                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-red-600"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-center text-sm font-medium text-ink/70"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Logout confirmation dialog */}
      <AnimatePresence>
        {confirmingLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"
            onClick={() => setConfirmingLogout(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl2 bg-surface p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <User size={18} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">Log out?</h3>
                  <p className="text-sm text-ink/60">You'll need to log in again to search or manage listings.</p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmingLogout(false)}
                  className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:border-ink/30"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}