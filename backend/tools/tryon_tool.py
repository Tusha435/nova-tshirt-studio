"""LangChain tool: fit a patterned t-shirt onto a real customer photo.

Two strategies:

  * generative (default) -- send the customer photo + the pattern to OpenAI's
    image-edit model (gpt-image-1). The model re-renders the SAME person now
    wearing a t-shirt that carries the generated design. Most photoreal.

  * composite (fallback) -- GPT-4o vision returns the torso quad, Pillow
    perspective-warps the pattern onto it. Deterministic + cheap; used if the
    edit call fails or generative=False.
"""
import json
import time
import uuid
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageEnhance
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from config import VISION_MODEL, IMAGE_MODEL, GENERATED_DIR
from openai_client import client, file_to_dataurl, b64_to_bytes

# ---------------------------------------------------------------- generative --

_EDIT_PROMPT = (
    "Photorealistically dress the SAME person in this photo in a t-shirt featuring "
    "the supplied graphic printed large across the chest. Keep the person's face, "
    "hair, pose, body, background and lighting identical and unchanged. Only replace "
    "their top with a well-fitted t-shirt whose front shows the graphic clearly, "
    "with natural fabric folds, wrinkles and shading consistent with the scene. "
    "Result must look like a real photograph of them wearing the shirt."
)


def _load_rgba(path: str) -> Image.Image:
    return Image.open(path).convert("RGBA")


def _to_png_bytes(img: Image.Image) -> bytes:
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _generative_tryon(customer_path: str, pattern_path: str) -> Path:
    """Re-render the person wearing the patterned shirt via images.edit.

    We pass two reference images: [0] the customer photo (the image being edited),
    [1] the pattern as visual reference for the print.
    """
    customer = _load_rgba(customer_path)
    pattern = _load_rgba(pattern_path)

    # gpt-image-1 edit accepts a list of input images; first is the primary.
    cust_file = ("customer.png", _to_png_bytes(customer), "image/png")
    patt_file = ("pattern.png", _to_png_bytes(pattern), "image/png")

    resp = client().images.edit(
        model=IMAGE_MODEL,
        image=[cust_file, patt_file],
        prompt=_EDIT_PROMPT,
        size="1024x1024",
    )
    out_bytes = b64_to_bytes(resp.data[0].b64_json)
    name = f"tryon_gen_{int(time.time())}_{uuid.uuid4().hex[:8]}.png"
    out_path = GENERATED_DIR / name
    out_path.write_bytes(out_bytes)
    return out_path


# ---------------------------------------------------------------- composite ---

_VISION_INSTRUCTIONS = (
    "You are a virtual try-on vision assistant. Look at the person in the image and "
    "locate the front torso area where a t-shirt graphic should be printed (chest to "
    "mid-stomach, between the shoulders). Return STRICT JSON only, no prose:\n"
    "{\n"
    '  "found": true/false,\n'
    '  "quad": [[x,y],[x,y],[x,y],[x,y]],   // TL, TR, BR, BL of the print area, 0..1 normalized\n'
    '  "brightness": 0.0-2.0,\n'
    '  "notes": "short note"\n'
    "}\n"
    "If no clear person/torso is visible set found=false."
)


def _vision_locate_torso(customer_path: str) -> dict:
    data_url = file_to_dataurl(customer_path)
    resp = client().chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": _VISION_INSTRUCTIONS},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
        temperature=0,
        max_completion_tokens=400,
    )
    raw = resp.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw[raw.find("{"):]
    return json.loads(raw)


def _warp_and_composite(customer_path: str, pattern_path: str, info: dict) -> Path:
    base = _load_rgba(customer_path)
    W, H = base.size
    quad = info.get("quad") or [[0.34, 0.30], [0.66, 0.30], [0.66, 0.62], [0.34, 0.62]]
    pts = [(x * W, y * H) for x, y in quad]
    (tlx, tly), (trx, try_), (brx, bry), (blx, bly) = pts

    pattern = _load_rgba(pattern_path)
    # PIL QUAD coeffs order: TL, BL, BR, TR of the source rectangle.
    coeffs = (tlx, tly, blx, bly, brx, bry, trx, try_)
    warped = pattern.transform((W, H), Image.QUAD, coeffs, resample=Image.BICUBIC)

    brightness = max(0.5, min(1.6, float(info.get("brightness", 1.0) or 1.0)))
    warped = ImageEnhance.Brightness(warped).enhance(brightness)
    alpha = warped.split()[3].point(lambda a: int(a * 0.92))
    warped.putalpha(alpha)

    out = Image.alpha_composite(base, warped)
    name = f"tryon_{int(time.time())}_{uuid.uuid4().hex[:8]}.png"
    out_path = GENERATED_DIR / name
    out.convert("RGB").save(out_path, "PNG")
    return out_path


def _composite_tryon(customer_path: str, pattern_path: str) -> tuple[Path, dict]:
    info = _vision_locate_torso(customer_path)
    if not info.get("found", False):
        raise RuntimeError(
            "Couldn't detect a clear person/torso. Try a front-facing, well-lit photo."
        )
    return _warp_and_composite(customer_path, pattern_path, info), info


# ---------------------------------------------------------------- public api --

class TryOnInput(BaseModel):
    customer_image_path: str = Field(
        ..., description="Local path to the customer's photo (uploaded by the frontend)."
    )
    pattern_image_path: str = Field(
        ..., description="Local path to the generated t-shirt pattern PNG to apply."
    )
    generative: bool = Field(
        True,
        description="If true, re-render the person wearing the shirt (photoreal). "
        "If false, use the fast vision-quad composite.",
    )


def virtual_tryon(customer_image_path: str,
                  pattern_image_path: str,
                  generative: bool = True) -> dict:
    """Fit a generated pattern onto a real customer photo and return its URL."""
    mode = "generative"
    try:
        if generative:
            out_path = _generative_tryon(customer_image_path, pattern_image_path)
            notes = "Photoreal generative try-on."
        else:
            raise RuntimeError("composite requested")
    except Exception as gen_err:
        # graceful fall back to deterministic composite
        try:
            out_path, info = _composite_tryon(customer_image_path, pattern_image_path)
            mode = "composite"
            notes = info.get("notes", "")
        except Exception as comp_err:
            return {
                "ok": False,
                "message": f"Try-on failed. generative: {gen_err}; composite: {comp_err}",
            }

    return {
        "ok": True,
        "mode": mode,
        "url": f"/static/generated/{out_path.name}",
        "path": str(out_path),
        "notes": notes,
        "message": f"Fitted the t-shirt onto the customer ({mode}).",
    }


tryon_tool = StructuredTool.from_function(
    func=virtual_tryon,
    name="virtual_tryon",
    description=(
        "Fit / try on a generated t-shirt pattern onto a REAL customer photo. "
        "Use after a pattern exists and the user provides a photo of a person. "
        "Returns a URL to the photoreal try-on image."
    ),
    args_schema=TryOnInput,
)
