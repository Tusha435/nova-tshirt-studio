import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { scrollToId } from "./SmoothScroll.jsx";

const SECTIONS = [
  { id: "top", label: "Top" },
  { id: "how", label: "How it works" },
  { id: "design", label: "Design" },
  { id: "tryon", label: "Try it on" },
  { id: "shop", label: "Shop" },
];

export default function SectionNav() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const targets = SECTIONS.map((section) => document.getElementById(section.id)).filter(Boolean);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="hidden lg:flex fixed right-6 top-1/2 z-40 -translate-y-1/2 flex-col gap-4">
      {SECTIONS.map((section) => {
        const isActive = active === section.id;
        return (
          <button
            key={section.id}
            onClick={() => scrollToId(section.id)}
            className="group flex items-center gap-3 rounded-full px-3 py-2 transition"
            aria-label={section.label}
          >
            <div className="relative flex h-3 w-3 items-center justify-center">
              {isActive && (
                <motion.span
                  layoutId="section-active-dot"
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500"
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                />
              )}
              <span className={`block h-2 w-2 rounded-full ${isActive ? "bg-white" : "bg-white/25"} transition`} />
            </div>
            <span className={`text-xs uppercase tracking-[0.3em] transition ${isActive ? "text-white" : "text-white/50 group-hover:text-white/80"}`}>
              {section.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}