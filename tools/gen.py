#!/usr/bin/env python3
"""Generate/edit images via OpenRouter (Gemini image models) for the PLAN A VN.

Mirrors the pipeline from the reference VN (Everything That Hurt You):
Nano Banana does BOTH text-to-image and reference-image editing, which is what
makes character consistency possible.

Usage:
  gen.py --out PATH --prompt "..." [--ref img.png ...] [--aspect 16:9|3:4|1:1]
         [--model MODEL] [--retries N]

Refs are passed as data-URLs (reference-conditioned edit). Pure-image models need
modalities=["image"] ONLY. Key from OPENROUTER_API_KEY (.strip()ed).
Exits nonzero on failure. A silent moderation refusal (200, no image) is a failure.
"""
import argparse, base64, json, mimetypes, os, sys, time
import requests

API = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT = "google/gemini-3-pro-image"   # Nano Banana Pro (author-designated standard)

def data_url(path):
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--ref", action="append", default=[])
    ap.add_argument("--aspect", default=None)
    ap.add_argument("--model", default=DEFAULT)
    ap.add_argument("--retries", type=int, default=3)
    a = ap.parse_args()

    key = os.environ["OPENROUTER_API_KEY"].strip()
    content = []
    for r in a.ref:
        content.append({"type": "image_url", "image_url": {"url": data_url(r)}})
    content.append({"type": "text", "text": a.prompt})
    body = {"model": a.model, "messages": [{"role": "user", "content": content}],
            "modalities": ["image"]}
    if a.aspect:
        body["image_config"] = {"aspect_ratio": a.aspect}

    last = None
    for attempt in range(a.retries):
        try:
            resp = requests.post(API, headers={"Authorization": f"Bearer {key}",
                                 "Content-Type": "application/json"}, json=body, timeout=420)
            j = resp.json()
            if resp.status_code != 200:
                raise RuntimeError(f"HTTP {resp.status_code}: {json.dumps(j)[:500]}")
            msg = j["choices"][0]["message"]
            images = msg.get("images") or []
            if not images:
                raise RuntimeError(f"no image (moderation?); text={str(msg.get('content'))[:200]}")
            url = images[0]["image_url"]["url"]
            b64 = url.split(",", 1)[1]
            os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
            with open(a.out, "wb") as f:
                f.write(base64.b64decode(b64))
            print(f"saved {a.out} ({len(b64)*3//4} bytes)")
            return 0
        except Exception as e:
            last = e
            print(f"attempt {attempt+1} failed: {e}", file=sys.stderr)
            time.sleep(3 * (attempt + 1))
    print(f"FAILED: {last}", file=sys.stderr)
    return 1

if __name__ == "__main__":
    sys.exit(main())
