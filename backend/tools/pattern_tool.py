"""LangChain tool: turn a natural-language idea into a printable t-shirt pattern.

Uses OpenAI's image model (gpt-image-1) as the 'transformer' that synthesises a
seamless, print-ready design which the frontend then maps onto a 3D t-shirt and
the try-on tool composites onto a real customer.
"""
import time
import uuid
from pathlib import Path

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from config import IMAGE_MODEL, GENERATED_DIR
from openai_client import client, b64_to_bytes

# How the design should be framed so it tiles/places cleanly on a garment.
_DESIGN_SYSTEM = (
    "Create a high-resolution, print-ready apparel graphic for the front of a "
    "t-shirt. The design must sit on a FLAT, PLAIN background (no mockup, no shirt, "
    "no person, no shadows) so it can be used as a texture/decal. Bold, clean edges, "
    "vivid but cohesive palette, centered composition with generous margins. "
    "Design brief: "
)


class PatternInput(BaseModel):
    prompt: str = Field(
        ...,
        description="Natural-language description of the t-shirt pattern/graphic to create, "
        "e.g. 'retro sunset with palm trees in synthwave colors'.",
    )
    style: str = Field(
        "vibrant modern streetwear",
        description="Optional style modifier, e.g. 'minimal line art', 'vintage', 'anime'.",
    )
    transparent: bool = Field(
        True,
        description="If true, request a transparent background so the graphic composites cleanly.",
    )


def generate_pattern(prompt: str,
                     style: str = "vibrant modern streetwear",
                     transparent: bool = True) -> dict:
    """Generate a print-ready t-shirt graphic and save it to /static/generated.

    Returns a dict with the public URL, the on-disk path and the prompt used so the
    agent/frontend can immediately render it onto the 3D shirt.
    """
    full_prompt = f"{_DESIGN_SYSTEM}{prompt}. Style: {style}."

    kwargs = dict(
        model=IMAGE_MODEL,
        prompt=full_prompt,
        size="1024x1024",
        n=1,
    )
    # gpt-image-1 supports transparent backgrounds; great for decals.
    if transparent:
        kwargs["background"] = "transparent"

    resp = client().images.generate(**kwargs)
    b64 = resp.data[0].b64_json
    img_bytes = b64_to_bytes(b64)

    name = f"pattern_{int(time.time())}_{uuid.uuid4().hex[:8]}.png"
    out_path: Path = GENERATED_DIR / name
    out_path.write_bytes(img_bytes)

    return {
        "ok": True,
        "url": f"/static/generated/{name}",
        "path": str(out_path),
        "prompt": full_prompt,
        "message": f"Generated t-shirt pattern '{prompt}' ({style}).",
    }


pattern_tool = StructuredTool.from_function(
    func=generate_pattern,
    name="generate_pattern",
    description=(
        "Generate a brand-new, print-ready t-shirt PATTERN/graphic from a text idea. "
        "Use whenever the user wants a new design, artwork, or motif on a shirt. "
        "Returns a URL to the generated PNG."
    ),
    args_schema=PatternInput,
)
