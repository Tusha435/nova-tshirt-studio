# NOVA — AI 3D T-Shirt Studio (full e-commerce site)

A complete multi-page storefront. Describe a design → an OpenAI image model
**transforms** it into a print-ready pattern → it wraps onto a live **3D t-shirt** →
upload a photo and OpenAI **regenerates you actually wearing it** (photoreal
generative try-on) → add to cart → checkout.

```
text idea ──▶ generate_pattern (gpt-image-1) ──▶ pattern.png  ──▶ 3D shirt (R3F)
                                                       │
photo + pattern ─▶ virtual_tryon ─▶ images.edit (gpt-image-1) ─▶ you wearing it
                                     └ fallback: GPT vision quad + Pillow warp
```

Both AI steps are **LangChain tools** orchestrated by an agent (`agent_loop.py`),
and also exposed as REST endpoints. Every design + try-on auto-saves to a gallery.

## Pages

| Route       | What it is                                                    |
| ----------- | ------------------------------------------------------------- |
| `/`         | Cinematic landing — animated hero, 3D shirt, how-it-works     |
| `/shop`     | Product catalogue; each tee opens the Studio pre-seeded       |
| `/studio`   | 3D design studio — generate patterns, recolour, add to cart   |
| `/tryon`    | Dedicated try-on — upload a photo, photoreal generative result|
| `/gallery`  | Every saved design + try-on; reload a design onto the shirt   |
| `/checkout` | Cart review + mock checkout (no real payment)                 |

---

## Layout

```
agent_loop.py            LangChain agent (create_agent) wiring both tools
backend/
  server.py              FastAPI: /api/generate-pattern, /api/tryon, /api/chat
  config.py              loads .env, paths, model names
  openai_client.py       shared OpenAI client + image helpers
  products.py            shop catalogue seed
  gallery.py             JSON-backed store for saved designs + try-ons
  tools/
    pattern_tool.py      generate_pattern  (the "transformer" → design)
    tryon_tool.py        virtual_tryon     (generative edit + composite fallback)
  data/gallery.json      persisted gallery records
  static/generated/      output PNGs are written + served here
frontend/                React + Vite + R3F + react-router + zustand
  src/pages/             Landing, Shop, Studio, TryOn, Gallery, Checkout
  src/components/        Shirt3D (procedural tailored tee), CartDrawer, Page
  src/store.js           zustand: current design + persisted cart
  src/lib/api.js         API client
.env.example             copy → .env and add OPENAI_API_KEY
```

## 1. Add your API key

```bash
cp .env.example .env      # then edit .env and paste your OpenAI key
```

The app boots and the 3D scene runs without a key; the AI calls return a clear
"OPENAI_API_KEY is not set" error until you add one.

## 2. Backend (Python 3.11)

```bash
py -m pip install -r backend/requirements.txt
cd backend
py -m uvicorn server:app --reload --port 8000
```

Quick CLI test of the agent:

```bash
py agent_loop.py "a cyberpunk koi fish in neon circuitry"
```

## 3. Frontend (Node 22)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173  (proxies /api + /static to :8000)
```

Open **http://localhost:5173**, describe a design, hit **Generate Pattern**, then
upload a front-facing photo to try it on.

## API

| Method | Path                    | Body                                  | Returns            |
| ------ | ----------------------- | ------------------------------------- | ------------------ |
| GET    | `/api/health`           | —                                     | key/config status  |
| POST   | `/api/generate-pattern` | `{prompt, style, transparent}`        | `{url, ...}`        |
| POST   | `/api/tryon`            | multipart `photo` + `pattern_url`     | `{url, ...}`        |
| POST   | `/api/chat`             | `{message}`                           | agent reply        |

## Notes / extending

- **Pattern engine** is `gpt-image-1` (transparent-background decals). Swap the model
  via `OPENAI_IMAGE_MODEL` in `.env`.
- **Try-on** is deterministic: GPT-4o returns the torso quad, Pillow perspective-warps
  the design onto it and brightness-matches the scene. For full photoreal regeneration,
  swap `virtual_tryon` for an image-edit model call.
- The 3D shirt is built from primitives (no external model file needed) so it runs
  anywhere; drop in a `.glb` later for a tailored mesh.
```
