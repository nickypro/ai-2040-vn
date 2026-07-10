#!/usr/bin/env python3
"""Suppress residual magenta fringe on cutout sprites.

Targets ONLY pixels that are (a) in the feathered edge zone (alpha<250) or
within 2px of a transparent pixel, and (b) magenta-hued (R and B both well
above G, R~B). Those pixels are desaturated toward their green channel, which
turns a purple rim into a neutral dark edge without touching red accents
(low B) or warm glows (low B vs R).

Usage: defringe.py FILE... (in place)
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

for path in sys.argv[1:]:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    r = arr[..., 0].astype(np.int16)
    g = arr[..., 1].astype(np.int16)
    b = arr[..., 2].astype(np.int16)
    a = arr[..., 3]

    # edge zone: semi-transparent, or near a transparent pixel (dilate alpha==0)
    am = Image.fromarray(a, "L")
    near_hole = np.array(am.filter(ImageFilter.MinFilter(5))) < 250
    edge = (a < 250) | near_hole

    magenta = (r > g + 40) & (b > g + 40) & (np.abs(r - b) < 80)
    m = edge & magenta & (a > 0)
    n = int(m.sum())
    if n:
        # pull chroma out: set R and B toward G (neutral grey of same luma-ish)
        arr[..., 0][m] = ((r[m] + 2 * g[m]) // 3).astype(np.uint8)
        arr[..., 2][m] = ((b[m] + 2 * g[m]) // 3).astype(np.uint8)
    Image.fromarray(arr, "RGBA").save(path)
    print(f"{path}: defringed {n} px")
