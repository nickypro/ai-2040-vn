#!/usr/bin/env python3
"""Chroma-key a magenta-background sprite to a transparent PNG, and trim any
uniform paper-border mat the model added around the chroma field.

Usage: cutout.py IN.png OUT.png [--pad 12]

Method (per the reference art pipeline lessons):
- auto-detect the key from the corner-pixel median;
- if the key isn't bright magenta (a border mat), first flood the outer mat by
  detecting the dominant near-uniform border color and keying that too;
- build alpha by distance to the key color(s); erode + feather the edge;
- warn if <5% of pixels were removed (likely a bad key).
"""
import sys, argparse
import numpy as np
from PIL import Image, ImageFilter

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inp"); ap.add_argument("outp")
    ap.add_argument("--pad", type=int, default=10)
    a = ap.parse_args()
    im = Image.open(a.inp).convert("RGB")
    arr = np.asarray(im).astype(np.int16)
    h, w, _ = arr.shape

    # magenta key: high R, low G, high B
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    magenta = (r > 150) & (g < 120) & (b > 150) & (np.abs(r - b) < 90)

    # detect a uniform outer mat (e.g. cream border) via corner median, and key
    # any connected border region matching it within tolerance
    corners = np.concatenate([
        arr[:8, :8].reshape(-1, 3), arr[:8, -8:].reshape(-1, 3),
        arr[-8:, :8].reshape(-1, 3), arr[-8:, -8:].reshape(-1, 3),
    ])
    cmed = np.median(corners, axis=0)
    is_magenta_corner = (cmed[0] > 150 and cmed[1] < 120 and cmed[2] > 150)
    mat = np.zeros((h, w), bool)
    if not is_magenta_corner:
        # corner is a mat color (not magenta): flood border pixels near cmed
        dist = np.sqrt(((arr - cmed) ** 2).sum(-1))
        near = dist < 45
        # keep only the border-connected component via a simple margin flood
        from collections import deque
        seen = np.zeros((h, w), bool)
        dq = deque()
        for x in range(w):
            for y in (0, h - 1):
                if near[y, x] and not seen[y, x]:
                    dq.append((y, x)); seen[y, x] = True
        for y in range(h):
            for x in (0, w - 1):
                if near[y, x] and not seen[y, x]:
                    dq.append((y, x)); seen[y, x] = True
        while dq:
            y, x = dq.popleft()
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny, nx = y+dy, x+dx
                if 0<=ny<h and 0<=nx<w and near[ny,nx] and not seen[ny,nx]:
                    seen[ny,nx]=True; dq.append((ny,nx))
        mat = seen

    key = magenta | mat
    removed = key.mean()
    if removed < 0.05:
        print(f"WARN {a.inp}: only {removed*100:.1f}% keyed (bad key?)", file=sys.stderr)

    alpha = np.where(key, 0, 255).astype(np.uint8)
    am = Image.fromarray(alpha, "L")
    # erode a hair (remove magenta fringe) then feather
    am = am.filter(ImageFilter.MinFilter(3))
    am = am.filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA")
    out.putalpha(am)

    # trim fully-transparent margins, then pad
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    if a.pad:
        pw, ph = out.size
        canvas = Image.new("RGBA", (pw + 2*a.pad, ph + 2*a.pad), (0,0,0,0))
        canvas.paste(out, (a.pad, a.pad), out)
        out = canvas
    out.save(a.outp)
    print(f"cut {a.inp} -> {a.outp} ({removed*100:.0f}% keyed, {out.size[0]}x{out.size[1]})")

if __name__ == "__main__":
    main()
