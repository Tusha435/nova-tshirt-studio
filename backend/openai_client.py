"""Single shared OpenAI client + small image helpers."""
import base64
import io
from openai import OpenAI

from config import require_key

_client: OpenAI | None = None


def client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=require_key())
    return _client


def b64_to_bytes(b64: str) -> bytes:
    return base64.b64decode(b64)


def bytes_to_dataurl(data: bytes, mime: str = "image/png") -> str:
    return f"data:{mime};base64,{base64.b64encode(data).decode()}"


def file_to_dataurl(path: str) -> str:
    with open(path, "rb") as f:
        data = f.read()
    mime = "image/png" if path.lower().endswith(".png") else "image/jpeg"
    return bytes_to_dataurl(data, mime)
