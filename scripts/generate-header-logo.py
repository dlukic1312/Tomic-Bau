#!/usr/bin/env python3
"""Build responsive header elements from TOMIC BAU's genuine source logo."""
from collections import deque
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / "assets" / "original-logo.webp").convert("RGB")

def extract(box, remove_all_white=False):
    photo = source.crop(box)
    width, height = photo.size
    pixels = photo.load()
    seen = bytearray(width * height)
    queue = deque()
    def background(x, y):
        r, g, b = pixels[x, y]
        return min(r, g, b) > 208 and max(r, g, b) - min(r, g, b) < 26
    for x in range(width):
        for y in (0, height - 1):
            if background(x, y):
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if background(x, y):
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if seen[index] or not background(x, y):
            continue
        seen[index] = 1
        if x > 0: queue.append((x - 1, y))
        if x < width - 1: queue.append((x + 1, y))
        if y > 0: queue.append((x, y - 1))
        if y < height - 1: queue.append((x, y + 1))
    alpha = Image.new("L", (width, height))
    alpha.putdata([0 if seen[i] or (remove_all_white and background(i % width, i // width)) else 255 for i in range(width * height)])
    result = photo.convert("RGBA")
    result.putalpha(alpha)
    return result

# Exclude the old curved golden track above the lettering: typography unchanged.
word = extract((65, 440, 875, 718))  # Clean white margin above glyphs; excludes old gold arc
word.save(ROOT / "assets" / "header-schrift.webp", format="WEBP", lossless=True, method=6)

# Preserve the original excavator and pipes. The crawler base belongs below the machine.
excavator = extract((74, 33, 860, 415), remove_all_white=True)  # All disconnected white background pockets transparent; preserve gold/black pixels
width, height = excavator.size
canvas = Image.new("RGBA", (width, height + 56))
canvas.alpha_composite(excavator, (0, 0))
draw = ImageDraw.Draw(canvas)
left, right = 415, 776  # Track length +8%; same right edge and height
top, bottom = height - 2, height + 38
draw.rounded_rectangle((left - 4, top - 4, right + 4, bottom + 4),
                       radius=20, fill=(12, 12, 11, 250))
draw.rounded_rectangle((left, top, right, bottom), radius=18,
                       fill=(234, 168, 26), outline=(255, 231, 113), width=3)
draw.rounded_rectangle((left + 9, top + 9, right - 9, bottom - 9),
                       radius=13, fill=(28, 29, 25), outline=(171, 98, 4), width=2)
for x in range(left + 26, right - 10, 36):
    draw.ellipse((x - 9, top + 12, x + 9, top + 30),
                 fill=(208, 138, 13), outline=(255, 220, 78), width=2)
    draw.ellipse((x - 4, top + 17, x + 4, top + 25), fill=(39, 36, 25))
canvas.save(ROOT / "assets" / "header-bagger.webp", format="WEBP", lossless=True, method=6)
print("Generated unchanged original lettering and excavator; only crawler base length adjusted.")
