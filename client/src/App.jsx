import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import PropertyDetails from "./pages/PropertyDetails.jsx";
import Favorites from "./pages/Favorites.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Messages from "./pages/Messages.jsx";
import AddProperty from "./pages/AddProperty.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function PageWrap({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrap><Home /></PageWrap>} />
            <Route path="/search" element={<PageWrap><SearchResults /></PageWrap>} />
            <Route path="/property/:id" element={<PageWrap><PropertyDetails /></PageWrap>} />
            <Route path="/favorites" element={<PageWrap><Favorites /></PageWrap>} />
            <Route path="/login" element={<PageWrap><Login /></PageWrap>} />
            <Route path="/register" element={<PageWrap><Register /></PageWrap>} />
            <Route path="/dashboard" element={<PageWrap><ProtectedRoute><Dashboard /></ProtectedRoute></PageWrap>}/>
            <Route path="/dashboard/add-property"
              element={<PageWrap><ProtectedRoute><AddProperty /></ProtectedRoute></PageWrap>}
            />
            <Route
              path="/messages"
              element={<PageWrap><ProtectedRoute><Messages /></ProtectedRoute></PageWrap>}
            />
          </Routes>
        </AnimatePresence>
      </main>
      {/* <Footer /> */}
    </div>
  );
}