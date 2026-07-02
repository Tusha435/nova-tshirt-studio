"""Central config + paths. Loads .env from the project root."""
import os
from pathlib import Path
from dotenv import load_dotenv

# project root = parent of /backend
ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

BACKEND_DIR = Path(__file__).resolve().parent
STATIC_DIR = BACKEND_DIR / "static"
GENERATED_DIR = STATIC_DIR / "generated"
TEMPLATES_DIR = STATIC_DIR / "templates"
DATA_DIR = BACKEND_DIR / "data"
GALLERY_DB = DATA_DIR / "gallery.json"

for _d in (GENERATED_DIR, TEMPLATES_DIR, DATA_DIR):
    _d.mkdir(parents=True, exist_ok=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1")
VISION_MODEL = os.getenv("OPENAI_VISION_MODEL", "gpt-4o")
AGENT_MODEL = os.getenv("OPENAI_AGENT_MODEL", "gpt-4o")


def require_key() -> str:
    """Raise a clear, user-facing error if the key is missing."""
    if not OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Copy .env.example to .env and add your key, "
            "then restart the server."
        )
    return OPENAI_API_KEY
