"""Tiny JSON-backed gallery store for generated designs and try-on results.

Each record:
  { "id", "kind": "pattern"|"tryon", "url", "prompt", "style", "created" }
Newest first. Good enough for a single-user demo; swap for SQLite if it grows.
"""
import json
import time
import uuid
from threading import Lock

from config import GALLERY_DB

_lock = Lock()


def _read() -> list[dict]:
    if not GALLERY_DB.exists():
        return []
    try:
        return json.loads(GALLERY_DB.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def _write(items: list[dict]) -> None:
    GALLERY_DB.write_text(json.dumps(items, indent=2), encoding="utf-8")


def add(kind: str, url: str, prompt: str = "", style: str = "", extra: dict | None = None) -> dict:
    rec = {
        "id": uuid.uuid4().hex[:12],
        "kind": kind,
        "url": url,
        "prompt": prompt,
        "style": style,
        "created": int(time.time()),
        **(extra or {}),
    }
    with _lock:
        items = _read()
        items.insert(0, rec)
        _write(items)
    return rec


def list_all(kind: str | None = None) -> list[dict]:
    items = _read()
    if kind:
        items = [i for i in items if i.get("kind") == kind]
    return items


def get(item_id: str) -> dict | None:
    return next((i for i in _read() if i["id"] == item_id), None)


def delete(item_id: str) -> bool:
    with _lock:
        items = _read()
        new = [i for i in items if i["id"] != item_id]
        changed = len(new) != len(items)
        if changed:
            _write(new)
        return changed
