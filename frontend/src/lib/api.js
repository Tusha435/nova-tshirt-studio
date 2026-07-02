// Thin API client. Vite proxies /api + /static to the FastAPI backend on :8000.

async function jsonOrThrow(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.message || `Request failed (${res.status})`);
  return data;
}

export async function generatePattern(prompt, style, transparent = true) {
  const res = await fetch("/api/generate-pattern", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style, transparent }),
  });
  return jsonOrThrow(res);
}

export async function tryOn(file, patternUrl, generative = true) {
  const fd = new FormData();
  fd.append("photo", file);
  fd.append("pattern_url", patternUrl);
  fd.append("generative", generative ? "true" : "false");
  const res = await fetch("/api/tryon", { method: "POST", body: fd });
  return jsonOrThrow(res);
}

export async function getProducts() {
  return jsonOrThrow(await fetch("/api/products"));
}

export async function getGallery(kind) {
  const q = kind ? `?kind=${kind}` : "";
  return jsonOrThrow(await fetch(`/api/gallery${q}`));
}

export async function deleteGalleryItem(id) {
  return jsonOrThrow(await fetch(`/api/gallery/${id}`, { method: "DELETE" }));
}

export async function getHealth() {
  return jsonOrThrow(await fetch("/api/health"));
}
