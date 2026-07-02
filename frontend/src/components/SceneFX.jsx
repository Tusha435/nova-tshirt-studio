import React, { useEffect, useRef } from "react";

const PALETTE = [
  [124, 92, 255],
  [0, 240, 255],
  [255, 61, 240],
  [182, 255, 61],
  [255, 77, 141],
  [0, 191, 166],
];

function rnd(a, b) { return Math.random() * (b - a) + a; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

class Particle {
  constructor(w, h) { this.w = w; this.h = h; this.spawn(); }
  spawn() {
    this.x = rnd(0, this.w);
    this.y = rnd(0, this.h);
    const a = rnd(0, Math.PI * 2), s = rnd(0.18, 0.62);
    this.vx = Math.cos(a) * s;
    this.vy = Math.sin(a) * s;
    this.r = rnd(1.2, 3.0);
    this.col = pick(PALETTE);
    this.baseA = rnd(0.42, 0.92);
    this.alpha = 0;
    this.life = 0;
    this.maxLife = rnd(200, 540);
  }
  step(mx, my) {
    this.life++;
    const dx = this.x - mx, dy = this.y - my;
    const d2 = dx * dx + dy * dy;
    if (d2 < 22500) {
      const d = Math.sqrt(d2);
      const f = ((150 - d) / 150) * 0.092;
      this.vx += (dx / d) * f;
      this.vy += (dy / d) * f;
    }
    this.vx += (this.w * 0.5 - this.x) * 0.000085;
    this.vy += (this.h * 0.5 - this.y) * 0.000085;
    this.vx *= 0.986;
    this.vy *= 0.986;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10) this.x = this.w + 10;
    if (this.x > this.w + 10) this.x = -10;
    if (this.y < -10) this.y = this.h + 10;
    if (this.y > this.h + 10) this.y = -10;
    const t = this.life / this.maxLife;
    this.alpha =
      t < 0.08  ? (t / 0.08) * this.baseA :
      t > 0.88  ? ((1 - t) / 0.12) * this.baseA :
      this.baseA;
    if (this.life >= this.maxLife) this.spawn();
  }
  draw(ctx) {
    const [r, g, b] = this.col;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
    ctx.fill();
    const gd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 5.5);
    gd.addColorStop(0, `rgba(${r},${g},${b},${this.alpha * 0.32})`);
    gd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 5.5, 0, Math.PI * 2);
    ctx.fillStyle = gd;
    ctx.fill();
  }
}

class ShootingStar {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.active = false;
    this.countdown = rnd(2000, 10000);
    this.elapsed = 0;
    this.arm();
  }
  arm() {
    this.x = rnd(0.05, 0.85) * this.w;
    this.y = rnd(-0.05, 0.18) * this.h;
    const ang = rnd(22, 58) * Math.PI / 180;
    const sp = rnd(9, 18);
    this.vx = Math.cos(ang) * sp;
    this.vy = Math.sin(ang) * sp;
    this.col = pick(PALETTE);
    this.alpha = rnd(0.72, 1);
  }
  step(dt) {
    this.elapsed += dt;
    if (!this.active) {
      if (this.elapsed >= this.countdown) { this.active = true; this.elapsed = 0; }
      return;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.017;
    if (this.alpha <= 0 || this.y > this.h + 80) {
      this.active = false;
      this.arm();
      this.elapsed = 0;
      this.countdown = rnd(3000, 14000);
    }
  }
  draw(ctx) {
    if (!this.active) return;
    const [r, g, b] = this.col;
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const steps = 220 / spd;
    const tx = this.x - this.vx * steps;
    const ty = this.y - this.vy * steps;
    const gd = ctx.createLinearGradient(tx, ty, this.x, this.y);
    gd.addColorStop(0, `rgba(${r},${g},${b},0)`);
    gd.addColorStop(0.55, `rgba(${r},${g},${b},${this.alpha * 0.42})`);
    gd.addColorStop(1, `rgba(255,255,255,${this.alpha})`);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = gd;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha * 0.9})`;
    ctx.fill();
    ctx.restore();
  }
}

export default function SceneFX() {
  const cvs = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const N = Math.min(175, Math.floor((w * h) / 7000));
    const particles = Array.from({ length: N }, () => new Particle(w, h));
    const stars = Array.from({ length: 6 }, () => new ShootingStar(w, h));

    let raf, last = performance.now();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      particles.forEach((p) => { p.w = w; p.h = h; });
      stars.forEach((s) => { s.w = w; s.h = h; });
    };
    const onMouse = (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse, { passive: true });

    const draw = (now) => {
      const dt = Math.min(now - last, 40);
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 9801) {
            const [r, g, b] = particles[i].col;
            const a = (1 - Math.sqrt(d2) / 99) * 0.28;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => { p.step(mouse.current.x, mouse.current.y); p.draw(ctx); });
      stars.forEach((s) => { s.step(dt); s.draw(ctx); });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={cvs}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.68 }}
    />
  );
}
