import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useMotionValue,
  useInView,
  useAnimationFrame,
} from "framer-motion";

export function useScrollVelocity() {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 420 });
  return useTransform(smooth, [-3000, 0, 3000], [-1, 0, 1], { clamp: true });
}

export function useVelocityRef() {
  const velocity = useScrollVelocity();
  const ref = useRef(0);
  useEffect(() => velocity.on("change", (value) => (ref.current = value)), [velocity]);
  return ref;
}

export function VelocitySkew({ children, className = "", intensity = 1 }) {
  const velocity = useScrollVelocity();
  const skew = useTransform(velocity, [-1, 0, 1], [5 * intensity, 0, -5 * intensity]);
  const scaleY = useTransform(velocity, [-1, 0, 1], [1.05, 1, 1.05]);
  return (
    <motion.div style={{ skewY: skew, scaleY }} className={className}>
      {children}
    </motion.div>
  );
}

export function Magnetic({ children, className = "", strength = 0.35, as = "a", ...rest }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 20 });
  const Comp = motion[as] || motion.div;

  function handleMove(event) {
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <Comp
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x, y }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function Parallax({ children, speed = 0.2, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}px`, `${-speed * 100}px`]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

export function CountUp({ to = 100, suffix = "", duration = 1.4, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  const [value, setValue] = useState(0);
  const startTimestamp = useRef(null);

  useAnimationFrame((time) => {
    if (!inView) return;
    if (startTimestamp.current == null) startTimestamp.current = time;
    const progress = Math.min(1, (time - startTimestamp.current) / (duration * 1000));
    const eased = 1 - Math.pow(1 - progress, 3);
    setValue(Math.round(eased * to));
  });

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}

export function SplitText({ text, className = "", wordClass = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className} style={{ display: "inline-block" }}>
      {words.map((word, index) => (
        <span key={index} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "120%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{ delay: index * 0.04, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className={wordClass}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Pop({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 120, damping: 14, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── GlitchText ── CSS pseudo-element RGB-split glitch ─────────── */
export function GlitchText({ text, className = "", as: Tag = "span" }) {
  return (
    <Tag className={`glitch-text ${className}`} data-text={text}>
      {text}
    </Tag>
  );
}

/* ── Card3D ── mouse-tracking tilt + spotlight ──────────────────── */
export function Card3D({ children, className = "", intensity = 14, ...rest }) {
  const ref = useRef(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 200, damping: 22 });
  const springY = useSpring(rotY, { stiffness: 200, damping: 22 });
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    rotX.set((0.5 - ny) * intensity);
    rotY.set((nx - 0.5) * intensity);
    setSpot({ x: nx * 100, y: ny * 100 });
  }, [intensity, rotX, rotY]);

  const onLeave = useCallback(() => {
    rotX.set(0);
    rotY.set(0);
    setHovered(false);
  }, [rotX, rotY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
      className={`relative ${className}`}
      {...rest}
    >
      {hovered && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.13) 0%, rgba(124,92,255,0.06) 35%, transparent 65%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

/* ── CharReveal ── letter-by-letter float-in ────────────────────── */
export function CharReveal({ text, className = "", delay = 0, as: Tag = "span" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <Tag ref={ref} className={className} style={{ display: "inline", perspective: "600px" }}>
      {[...text].map((char, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
          initial={{ opacity: 0, y: 28, rotateX: -55 }}
          animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ delay: delay + i * 0.026, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
        >
          {char}
        </motion.span>
      ))}
    </Tag>
  );
}