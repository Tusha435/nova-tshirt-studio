import React, { useEffect } from "react";
import Lenis from "lenis";

export let lenis = null;

const defaultOptions = {
  duration: 1.05,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: true,
  infinite: false,
};

export default function SmoothScroll({ children }) {
  useEffect(() => {
    lenis = new Lenis(defaultOptions);

    let rafId;
    const loop = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}

export function scrollToId(id, opts = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -88, duration: 1.1, easing: defaultOptions.easing, ...opts });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}