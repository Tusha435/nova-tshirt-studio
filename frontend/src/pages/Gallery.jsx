import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getGallery, deleteGalleryItem } from "../lib/api.js";
import { useStore } from "../store.js";

const FILTERS = [
  { key: "", label: "All" },
  { key: "pattern", label: "Designs" },
  { key: "tryon", label: "Try-ons" },
];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const navigate = useNavigate();
  const setDesign = useStore((s) => s.setDesign);

  useEffect(() => {
    setLoading(true);
    getGallery(filter)
      .then((data) => {
        setItems(data.items || []);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Unable to load gallery.");
      })
      .finally(() => setLoading(false));
  }, [filter]);

  async function removeItem(id) {
    try {
      await deleteGalleryItem(id);
      setItems((current) => current.filter((item) => item.id !== id));
      if (activeItem?.id === id) setActiveItem(null);
    } catch {
      setError("Could not remove item.");
    }
  }

  function reuseDesign(item) {
    if (item.kind !== "pattern") return;
    setDesign({ patternUrl: item.url, prompt: item.prompt, style: item.style });
    navigate("/studio");
  }

  return (
    <Page className="max-w-7xl mx-auto px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold">Your Gallery</h1>
          <p className="text-white/45 mt-2">
            Browse every saved design and try-on from your NOVA session.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                filter === filterOption.key
                  ? "bg-neon/25 border border-neon text-white"
                  : "border border-white/10 text-white/60 hover:border-white/30"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 rounded-[2rem] bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-[2rem] p-16 text-center text-white/40">
          No gallery items yet. Generate a design in the studio and it will appear here automatically.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 8) * 0.04 }}
              className="glass holo rounded-[2rem] overflow-hidden group"
            >
              <button
                type="button"
                onClick={() => setActiveItem(item)}
                className="relative aspect-square w-full overflow-hidden bg-black/20"
              >
                <img
                  src={item.url}
                  alt={item.prompt || "Saved item"}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70">
                  {item.kind === "pattern" ? "design" : "try-on"}
                </span>
              </button>

              <div className="p-4">
                <p className="text-sm text-white/50 line-clamp-2">{item.prompt || "No prompt available"}</p>
                <div className="mt-4 flex gap-2">
                  {item.kind === "pattern" && (
                    <button
                      onClick={() => reuseDesign(item)}
                      className="flex-1 rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/15 transition"
                    >
                      Use pattern
                    </button>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-2xl border border-white/10 px-3 py-2 text-center text-xs text-white/60 hover:border-white/30 transition"
                  >
                    Open
                  </a>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-2xl bg-rose-500/10 px-3 py-2 text-xs text-rose-300/80 hover:bg-rose-500/15 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {activeItem && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-3xl rounded-[2rem] bg-ink/95 border border-white/10 p-6"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="absolute right-5 top-5 text-2xl text-white/60 hover:text-white"
                aria-label="Close preview"
              >
                ×
              </button>
              <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-[1.75rem] overflow-hidden bg-black/20">
                  <img src={activeItem.url} alt={activeItem.prompt || "Preview"} className="h-full w-full object-contain" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm uppercase tracking-[0.3em] text-cyber/70">Preview</div>
                    <h2 className="mt-3 text-2xl font-semibold">{activeItem.kind === "pattern" ? "AI design" : "Try-on result"}</h2>
                    <p className="mt-3 text-white/50">{activeItem.prompt || "No prompt available"}</p>
                  </div>
                  {activeItem.kind === "pattern" && (
                    <button
                      onClick={() => {
                        reuseDesign(activeItem);
                        setActiveItem(null);
                      }}
                      className="btn-neon w-full py-3.5 rounded-xl"
                    >
                      Use this design
                    </button>
                  )}
                  <button
                    onClick={() => setActiveItem(null)}
                    className="btn-ghost w-full py-3.5 rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}