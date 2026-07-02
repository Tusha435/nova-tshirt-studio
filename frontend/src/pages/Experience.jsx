import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import ScrollShirt from "../components/ScrollShirt.jsx";
import Avatar3D from "../components/Avatar3D.jsx";
import MiniShirt from "../components/MiniShirt.jsx";
import {
  useVelocityRef,
  VelocitySkew,
  Magnetic,
  Parallax,
  CountUp,
  SplitText,
  Pop,
  GlitchText,
  Card3D,
  CharReveal,
} from "../components/scrollFun.jsx";
import { generatePattern, tryOn, getProducts } from "../lib/api.js";
import { useStore } from "../store.js";

const STYLES = [
  "vibrant modern streetwear",
  "minimal line art",
  "vintage retro",
  "synthwave neon",
  "anime-inspired",
  "abstract geometry",
];
const COLORS = ["#f4f4f8", "#0a0a0f", "#7c5cff", "#00bfa6", "#ff3df0", "#b6ff3d"];

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Hero() {
  const wrap = useRef();
  const progress = useRef(0);
  const velocity = useVelocityRef();
  const { patternUrl, shirtColor } = useStore();
  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      progress.current = v;
    });
    return unsub;
  }, [scrollYProgress]);

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const shirtX = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section ref={wrap} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,_#7c5cff,_#00f0ff,_#ff3df0,_#b6ff3d)] opacity-40 blur-3xl" />
          <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-1/3 top-1/2 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        </div>

        <motion.div style={{ x: shirtX }} className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
          <ScrollShirt
            color={shirtColor || "#7c5cff"}
            patternUrl={patternUrl}
            progress={progress}
            velocity={velocity}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/70 to-transparent pointer-events-none" />

        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <motion.div style={{ y: headlineY, opacity: headlineOpacity }} className="max-w-xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-ink/10 bg-ink/5 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyber/75 mb-7">
              ✦ AI-powered design studio
            </div>
            <h1 className="text-4xl md:text-6xl xl:text-7xl font-black leading-[1.06] tracking-tight">
              <CharReveal text="Wear your imagination." delay={0.1} /><br />
              <GlitchText text="See it move." className="neon-text" />
            </h1>
            <p className="text-ink/55 mt-8 text-lg max-w-xl">
              <SplitText text="Describe any idea, spin it onto a 3D tee, visualize it on a model, then checkout the future of custom apparel." />
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Magnetic href="#design" className="btn-neon px-8 py-3.5 rounded-xl text-sm inline-block">
                Start designing
              </Magnetic>
              <Magnetic href="#shop" className="btn-ghost px-8 py-3.5 rounded-xl text-sm inline-block">
                Explore the drop
              </Magnetic>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-14">
              {[
                { value: "∞", label: "endless ideas" },
                { value: "3D", label: "live preview" },
                { value: "AI", label: "instant creation" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.value}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="rounded-3xl border border-ink/10 bg-ink/5 p-6 backdrop-blur-sm"
                  style={{ transformPerspective: 600 }}
                >
                  <div className="text-3xl font-bold grad-text">{stat.value}</div>
                  <p className="text-ink/40 text-sm mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink/40 text-sm flex flex-col items-center gap-3"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          <span>scroll to unlock</span>
          <span className="h-9 w-5 rounded-full border border-ink/20 flex items-start justify-center pt-1.5">
            <span className="block h-2 w-2 rounded-full bg-cyber" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Describe your idea",
    description: "Type a prompt and choose a design mood. The AI creates a pattern built for apparel.",
    icon: "✍️",
  },
  {
    number: "02",
    title: "Watch it wrap in 3D",
    description: "The pattern animates onto a virtual tee while you explore every angle.",
    icon: "🌀",
  },
  {
    number: "03",
    title: "See it worn",
    description: "Try it on a model or upload your photo to preview the finished look.",
    icon: "📸",
  },
];

const MARQUEE = [
  { value: "Infinite", label: "Design Possibilities" },
  { value: "GPT-4o", label: "Vision AI" },
  { value: "Real-time", label: "3D Preview" },
  { value: "Zero friction", label: "Idea to Tee" },
  { value: "Every drop", label: "Auto-saved" },
  { value: "Sub-second", label: "Pattern Generation" },
  { value: "Unlimited", label: "Color Palettes" },
  { value: "AI-native", label: "Try-on Engine" },
];

function StatsTicker() {
  return (
    <div className="relative overflow-hidden border-y border-ink/8 py-5 my-2">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#f6f5fe] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#f6f5fe] to-transparent pointer-events-none" />
      <div className="ticker-inner flex gap-14 whitespace-nowrap">
        {[...MARQUEE, ...MARQUEE].map((item, i) => (
          <div key={i} className="inline-flex items-center gap-5 flex-shrink-0">
            <span className="text-xl font-black grad-text">{item.value}</span>
            <span className="text-ink/35 text-xs uppercase tracking-[0.28em]">{item.label}</span>
            <span className="text-violet-500/40 text-sm">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="relative max-w-7xl mx-auto px-5 py-28">
      <VelocitySkew>
        <div className="text-center mb-14">
          <div className="text-cyber text-sm uppercase tracking-[0.3em] mb-4">How it works</div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            <SplitText text="From prompt to print-ready apparel" />
          </h2>
        </div>
      </VelocitySkew>
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <Pop key={step.number} delay={index * 0.08}>
            <Card3D className="glass holo rounded-[2rem] p-8 min-h-[280px]" intensity={12}>
              <div className="text-6xl mb-5 select-none">{step.icon}</div>
              <div className="text-cyber text-xs uppercase tracking-[0.32em] mb-3">{step.number}</div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-ink/55 leading-relaxed">{step.description}</p>
            </Card3D>
          </Pop>
        ))}
      </div>
    </section>
  );
}

function DesignSection() {
  const { prompt, style, shirtColor, patternUrl, setDesign, addToCart } = useStore();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Add a creative prompt first.");
      return;
    }
    setError("");
    setStatus("loading");
    setSuccess("");
    try {
      const result = await generatePattern(prompt, style);
      setDesign({ patternUrl: result.url });
      setSuccess("Pattern generated successfully.");
    } catch (err) {
      setError(err.message || "Failed to generate design.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section id="design" className="relative max-w-7xl mx-auto px-5 py-28">
      <Reveal>
        <div className="text-center mb-12">
          <div className="text-cyber text-sm uppercase tracking-[0.3em] mb-4">Design studio</div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            <SplitText text="Create your next signature tee" />
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-2">
        <Reveal>
          <div className="glass holo rounded-[2.5rem] overflow-hidden min-h-[520px] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,255,255,0.18),transparent_28%)] pointer-events-none" />
            <MiniShirtStage color={shirtColor} patternUrl={patternUrl} />
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-3 rounded-full bg-white/70 px-4 py-3 backdrop-blur-xl">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setDesign({ shirtColor: color })}
                  aria-label={`Choose ${color}`}
                  className="h-9 w-9 rounded-full border-2 transition"
                  style={{
                    background: color,
                    borderColor: shirtColor === color ? "#00f0ff" : "rgba(255,255,255,0.18)",
                    transform: shirtColor === color ? "scale(1.12)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="glass holo rounded-[2.5rem] p-8 space-y-6">
            <div>
              <label className="text-xs uppercase tracking-[0.35em] text-ink/40">Prompt</label>
              <textarea
                rows="4"
                value={prompt}
                onChange={(event) => setDesign({ prompt: event.target.value })}
                className="mt-3 w-full resize-none bg-ink/5 border border-ink/10 focus:border-cyber focus:ring-cyber/20"
                placeholder="e.g. glowing koi fish in a neon circuit city"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.35em] text-ink/40">Style</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {STYLES.map((option) => (
                  <button
                    key={option}
                    onClick={() => setDesign({ style: option })}
                    className={`px-4 py-2 rounded-full border text-sm transition ${
                      style === option
                        ? "bg-neon/25 border-neon text-ink"
                        : "border-ink/10 text-ink/60 hover:border-ink/30"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={status === "loading"}
              className="btn-neon w-full py-3.5 rounded-xl"
            >
              {status === "loading" ? "Designing…" : "Generate pattern"}
            </button>

            {error && (
              <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10  px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {patternUrl && (
              <div className="rounded-3xl border border-ink/10 bg-ink/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-ink/50">Latest pattern</p>
                    <p className="font-semibold">Ready to preview and order</p>
                  </div>
                  <button
                    onClick={() => {
                      addToCart({
                        name: "Custom NOVA Tee",
                        color: shirtColor,
                        prompt,
                        patternUrl,
                        price: 32,
                      });
                      setSuccess("Added to cart!");
                      setTimeout(() => setSuccess(""), 2000);
                    }}
                    className="btn-ghost rounded-xl px-4 py-2 text-sm"
                  >
                    Add to cart
                  </button>
                </div>
                {success && (
                  <p className="mt-3 text-sm text-cyber">{success}</p>
                )}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MiniShirtStage({ color, patternUrl }) {
  return (
    <div className="relative h-full">
      <MiniShirt color={color} />
      {patternUrl && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-36 -translate-x-1/2 -translate-y-1/2 opacity-90">
          <img src={patternUrl} alt="Pattern preview" className="w-full" />
        </div>
      )}
    </div>
  );
}

function TryOnSection() {
  const { patternUrl, shirtColor, prompt } = useStore();
  const [mode, setMode] = useState("avatar");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef();

  async function handleUpload(file) {
    if (!file) return;
    if (!patternUrl) {
      setError("Generate a design before trying it on.");
      return;
    }
    setError("");
    setLoading(true);
    setResultUrl(null);
    setPhotoUrl(URL.createObjectURL(file));
    try {
      const result = await tryOn(file, patternUrl, true);
      setResultUrl(result.url);
    } catch (err) {
      setError(err.message || "Try-on failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="tryon" className="relative max-w-7xl mx-auto px-5 py-28">
      <Reveal>
        <div className="text-center mb-12">
          <div className="text-cyber text-sm uppercase tracking-[0.3em] mb-4">Try it on</div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            <SplitText text="Visualize the final look" />
          </h2>
        </div>
      </Reveal>

      <Reveal>
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-ink/5 p-1">
            {[
              { key: "avatar", label: "3D Model" },
              { key: "photo", label: "Your Photo" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                className={`px-6 py-3 rounded-full text-sm transition ${
                  mode === tab.key ? "btn-neon" : "text-ink/55 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        {mode === "avatar" ? (
          <div className="glass holo rounded-[2.5rem] overflow-hidden min-h-[62vh] relative">
            <Avatar3D patternUrl={patternUrl} shirtColor={shirtColor} />
            <div className="absolute bottom-5 left-5 rounded-3xl border border-ink/10 bg-white/70 px-4 py-2 text-sm text-ink/70">
              Drag to rotate the rigged model
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass holo rounded-[2.5rem] p-7">
              <div className="mb-5 text-sm text-ink/40">Upload a selfie and see the pattern on you.</div>
              <div className="mb-6 rounded-3xl bg-ink/5 min-h-[14rem] grid place-items-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="upload preview" className="max-h-80 object-contain" />
                ) : (
                  <span className="text-ink/30">Upload a photo</span>
                )}
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleUpload(event.target.files?.[0])}
              />
              <button
                onClick={() => fileInput.current?.click()}
                disabled={!patternUrl}
                className="btn-neon w-full py-3.5 rounded-xl"
              >
                {loading ? "Rendering…" : "Upload photo"}
              </button>
              {error && (
                <div className="mt-4 rounded-3xl border border-rose-400/20 bg-rose-500/10  px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </div>
            <div className="glass holo rounded-[2.5rem] p-7">
              <div className="mb-5 text-sm text-ink/40">Result</div>
              <div className="rounded-3xl bg-ink/5 min-h-[22rem] grid place-items-center overflow-hidden">
                {loading ? (
                  <div className="text-ink/50">
                    <div className="mb-4 h-10 w-10 rounded-full border-2 border-cyber/30 border-t-cyber animate-spin mx-auto" />
                    Rendering preview…
                  </div>
                ) : resultUrl ? (
                  <img src={resultUrl} alt="Try-on result" className="max-h-96 object-contain" />
                ) : (
                  <span className="text-ink/30">your result appears here</span>
                )}
              </div>
              {resultUrl && (
                <a
                  href={resultUrl}
                  download="nova-tryon.png"
                  className="btn-ghost mt-5 inline-block w-full rounded-xl px-4 py-3 text-center text-sm"
                >
                  Download result
                </a>
              )}
            </div>
          </div>
        )}
      </Reveal>
    </section>
  );
}

function ShopSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const setDesign = useStore((s) => s.setDesign);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="shop" className="relative max-w-7xl mx-auto px-5 py-28">
      <Reveal>
        <div className="text-center mb-12">
          <div className="text-cyber text-sm uppercase tracking-[0.3em] mb-4">Shop the drop</div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            <SplitText text="Pick your canvas" />
          </h2>
        </div>
      </Reveal>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="glass holo rounded-[2rem] p-8 animate-pulse bg-ink/10 h-80" />
          ))}
        </div>
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Pop key={product.id} delay={(index % 3) * 0.08}>
              <Card3D
                className="glass holo rounded-[2rem] p-5 cursor-pointer"
                intensity={11}
                onClick={() => {
                  setDesign({
                    shirtColor: product.color,
                    prompt: product.suggestPrompt,
                    style: product.suggestStyle,
                    patternUrl: null,
                  });
                  document.getElementById("design")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="relative mb-5 overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-ink/10 to-ink/5 h-56">
                  <MiniShirt color={product.color} />
                  <span className="absolute left-4 top-4 rounded-full bg-white/75 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-ink/60">
                    live
                  </span>
                  <div className="absolute right-4 bottom-4 rounded-3xl bg-white/75 px-3 py-2 text-sm text-ink/80">
                    ${product.price}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-ink/50 text-sm leading-relaxed">{product.tagline}</p>
              </Card3D>
            </Pop>
          ))}
        </div>
      )}
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="relative max-w-5xl mx-auto px-5 py-24">
      <div className="glass holo rounded-[2.5rem] p-14 text-center overflow-hidden relative">
        {/* Pulsing concentric rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-violet-500/18"
            style={{ x: "-50%", y: "-50%" }}
            animate={{
              width: [`${i * 120 + 80}px`, `${i * 180 + 340}px`],
              height: [`${i * 120 + 80}px`, `${i * 180 + 340}px`],
              opacity: [0.55, 0],
            }}
            transition={{ duration: 3.8, delay: i * 0.9, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <GlitchText text="Design" className="neon-text" />{" "}
            the future of your wardrobe.
          </h2>
          <p className="text-ink/45 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
            Every idea. Every color. Every drop. Yours.
          </p>
          <Magnetic href="#design" className="btn-neon px-10 py-4 rounded-3xl text-lg">
            Build your look
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

export default function Experience() {
  return (
    <div className="relative">
      <Hero />
      <main className="relative">
        <HowItWorks />
        <StatsTicker />
        <DesignSection />
        <TryOnSection />
        <ShopSection />
        <ClosingCTA />
      </main>
    </div>
  );
}