import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useStore } from "./store.js";
import SmoothScroll, { scrollToId } from "./components/SmoothScroll.jsx";
import SceneFX from "./components/SceneFX.jsx";
import SectionNav from "./components/SectionNav.jsx";
import Experience from "./pages/Experience.jsx";
import Checkout from "./pages/Checkout.jsx";
import Gallery from "./pages/Gallery.jsx";
import CartDrawer from "./components/CartDrawer.jsx";

const ANCHORS = [
  { id: "how", label: "How" },
  { id: "design", label: "Design" },
  { id: "tryon", label: "Try-On" },
  { id: "shop", label: "Shop" },
];

function CursorGlow() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let cx = 0, cy = 0, tx = 0, ty = 0, raf;

    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${tx - 5}px, ${ty - 5}px)`;
      }
    };

    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${cx - 20}px, ${cy - 20}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.25 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1.5 origin-left z-50 overflow-hidden"
    >
      <div className="h-full w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-lime-300 shadow-[0_0_28px_rgba(124,92,255,0.4)]" />
    </motion.div>
  );
}

function Navbar({ onCart }) {
  const count = useStore((s) => s.cartCount());
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/";

  const go = (id) => {
    if (onHome) scrollToId(id);
    else navigate("/", { state: { scrollTo: id } });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="max-w-7xl mx-auto px-5 mt-3">
        <div className="glass border border-ink/10 rounded-3xl h-16 px-4 flex items-center justify-between backdrop-blur-xl shadow-[0_18px_60px_rgba(90,70,190,0.18)]">
          <button
            onClick={() => (onHome ? scrollToId("top") : navigate("/"))}
            className="text-2xl font-black tracking-[0.18em] text-ink"
            aria-label="Go to home"
          >
            <span className="neon-text neon-flicker">NOVA</span>
          </button>

          <nav className="hidden md:flex items-center gap-2">
            {ANCHORS.map((a) => (
              <button
                key={a.id}
                onClick={() => go(a.id)}
                className="px-4 py-2 rounded-full text-sm text-ink/70 hover:text-ink hover:bg-ink/10 transition"
              >
                {a.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/gallery")}
              className="px-4 py-2 rounded-full text-sm text-ink/70 hover:text-ink hover:bg-ink/10 transition"
            >
              Gallery
            </button>
          </nav>

          <button
            onClick={onCart}
            className="relative px-4 py-2 rounded-full bg-ink/10 text-sm text-ink transition hover:bg-ink/15 shadow-[0_0_24px_rgba(124,92,255,0.16)]"
            aria-label="Open cart"
          >
            🛍 Cart
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-black text-[0.65rem] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-10">
      <div className="max-w-7xl mx-auto px-5 py-12 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="text-2xl font-extrabold neon-text mb-2">NOVA Studio</div>
          <p className="text-ink/45 max-w-lg text-sm">
            AI-designed apparel, 3D live preview, and instant checkout in a sleek neon experience.
          </p>
        </div>
        <div className="text-right">
          <p className="text-ink/35 text-sm">OpenAI image + vision · LangChain · React Three Fiber</p>
          <p className="text-ink/25 text-xs mt-4">Built for futuristic shopping and creative product discovery.</p>
        </div>
      </div>
      <div className="text-center text-ink/25 text-xs pb-8">© {new Date().getFullYear()} NOVA Studio — demo build.</div>
    </footer>
  );
}

function ScrollOnArrive() {
  const location = useLocation();
  React.useEffect(() => {
    const id = location.state?.scrollTo;
    if (location.pathname === "/" && id) {
      const timer = window.setTimeout(() => scrollToId(id), 120);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [location]);

  return null;
}

function HomeOnly({ children }) {
  return useLocation().pathname === "/" ? children : null;
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
      className="min-h-[calc(100vh-6rem)]"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <SmoothScroll>
      <div className="app-bg flex min-h-screen flex-col text-ink">
        <CursorGlow />
        <SceneFX />
        <ScrollProgress />
        <Navbar onCart={() => setCartOpen(true)} />
        <HomeOnly>
          <SectionNav />
        </HomeOnly>
        <ScrollOnArrive />

        <main className="flex-1 pt-24">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Experience /></PageTransition>} />
              <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
              <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
              <Route path="*" element={<PageTransition><Experience /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </SmoothScroll>
  );
}