#!/usr/bin/env python3
"""Extract genuine TOMIC BAU logo elements without redrawing letterforms or excavator."""
from collections import deque
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / "assets" / "original-logo.webp").convert("RGB")

def cut_original(box, name):
    photo = source.crop(box)
    width, height = photo.size
    pixels = photo.load()
    reached = bytearray(width * height)
    queue = deque()

    def white_background(x, y):
        red, green, blue = pixels[x, y]
        return min(red, green, blue) >= 210 and max(red, green, blue) - min(red, green, blue) < 27

    for x in range(width):
        for y in (0, height - 1):
            if white_background(x, y):
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if white_background(x, y):
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        i = y * width + x
        if reached[i] or not white_background(x, y):
            continue
        reached[i] = 1
        if x > 0: queue.append((x - 1, y))
        if x < width - 1: queue.append((x + 1, y))
        if y > 0: queue.append((x, y - 1))
        if y < height - 1: queue.append((x, y + 1))
    alpha = Image.new("L", (width, height))
    alpha.putdata([0 if value else 255 for value in reached])
    result = photo.convert("RGBA")
    result.putalpha(alpha)
    destination = ROOT / "assets" / name
    result.save(destination, format="WEBP", lossless=True, method=6)
    print(f"Generated {destination.name}: {width}x{height}")

# Precisely cropped from the single provided original, excluding the duplicated bottom label.
cut_original((61, 36, 863, 413), "header-bagger.webp")
# The original typeface and outlines are retained, including the gold bracket.
cut_original((14, 423, 923, 722), "header-schrift.webp")
