"""FastAPI server for the NOVA 3D T-Shirt Studio.

Endpoints:
  GET  /api/health            -> key/config status
  POST /api/generate-pattern  -> {prompt, style} -> pattern image url (auto-saved to gallery)
  POST /api/tryon             -> multipart photo + pattern_url [+ generative] -> try-on url
  POST /api/chat              -> {message} -> LangChain agent reply
  GET  /api/gallery           -> list saved designs/try-ons (?kind=pattern|tryon)
  DELETE /api/gallery/{id}    -> remove a saved item
  GET  /api/products          -> shop catalogue (static seed)
  /static/...                 -> generated + template images

Run:  uvicorn server:app --reload --port 8000   (from the backend/ dir)
"""
import sys
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# make sibling modules (backend/) and project root importable regardless of launch dir
_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))            # backend/  -> config, tools, openai_client
sys.path.insert(0, str(_HERE.parent))     # root/     -> agent_loop

import config
import gallery
from config import STATIC_DIR, GENERATED_DIR, OPENAI_API_KEY
from products import PRODUCTS
from tools.pattern_tool import generate_pattern
from tools.tryon_tool import virtual_tryon

app = FastAPI(title="NOVA 3D T-Shirt Studio API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


class PatternReq(BaseModel):
    prompt: str
    style: str = "vibrant modern streetwear"
    transparent: bool = True


class ChatReq(BaseModel):
    message: str


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "openai_key_set": bool(OPENAI_API_KEY),
        "image_model": config.IMAGE_MODEL,
        "vision_model": config.VISION_MODEL,
    }


@app.get("/api/products")
def products():
    return {"products": PRODUCTS}


@app.post("/api/generate-pattern")
def api_generate_pattern(req: PatternReq):
    try:
        result = generate_pattern(req.prompt, req.style, req.transparent)
        gallery.add("pattern", result["url"], prompt=req.prompt, style=req.style)
        return result
    except Exception as e:  # surface a clean message to the UI
        raise HTTPException(status_code=400, detail=str(e))


def _url_to_path(url: str) -> Path:
    """Map a /static/generated/<name> url back to the on-disk file."""
    name = url.rstrip("/").split("/")[-1]
    p = GENERATED_DIR / name
    if not p.exists():
        raise HTTPException(status_code=404, detail=f"Pattern not found: {name}")
    return p


@app.post("/api/tryon")
async def api_tryon(
    photo: UploadFile = File(...),
    pattern_url: str = Form(...),
    generative: bool = Form(True),
):
    suffix = ".png" if (photo.filename or "").lower().endswith(".png") else ".jpg"
    cust_name = f"customer_{int(time.time())}_{uuid.uuid4().hex[:8]}{suffix}"
    cust_path = GENERATED_DIR / cust_name
    cust_path.write_bytes(await photo.read())

    pattern_path = _url_to_path(pattern_url)
    try:
        result = virtual_tryon(str(cust_path), str(pattern_path), generative=generative)
        if not result.get("ok"):
            raise HTTPException(status_code=400, detail=result.get("message", "Try-on failed"))
        gallery.add(
            "tryon", result["url"],
            extra={"source": f"/static/generated/{cust_name}", "mode": result.get("mode")},
        )
        result["source"] = f"/static/generated/{cust_name}"
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/gallery")
def api_gallery(kind: str | None = None):
    return {"items": gallery.list_all(kind)}


@app.delete("/api/gallery/{item_id}")
def api_gallery_delete(item_id: str):
    if not gallery.delete(item_id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@app.post("/api/chat")
def api_chat(req: ChatReq):
    from agent_loop import run  # lazy so /health works without langchain/key
    try:
        result = run(req.message)
        return {"ok": True, "output": result.get("output", "")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
