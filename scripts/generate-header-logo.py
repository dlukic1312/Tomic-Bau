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
# Baseline belongs to the excavator group; placed underneath, without modifying artwork.
# Straight gold bar extending below the bucket, pipes and crawler.
line_y = height + 47
draw.rounded_rectangle((7, line_y - 5, width - 7, line_y + 3),
                       radius=4, fill=(197, 128, 10, 255))
draw.line((13, line_y - 3, width - 13, line_y - 3),
          fill=(255, 221, 77, 255), width=3)

# Schematic continuous track, with no road wheels or mechanical roller details.
# Only the track is modified; everything above remains the source pixels.
left, right = 415, 776
top, bottom = height - 2, height + 38
draw.rounded_rectangle((left - 3, top - 3, right + 3, bottom + 3),
                       radius=20, fill=(17, 16, 13, 255))
draw.rounded_rectangle((left, top, right, bottom), radius=18,
                       fill=(229, 164, 22, 255), outline=(255, 226, 99, 255), width=3)
draw.rounded_rectangle((left + 9, top + 9, right - 9, bottom - 9),
                       radius=12, fill=(29, 29, 25, 255), outline=(176, 112, 13, 255), width=2)
canvas.save(ROOT / "assets" / "header-bagger.webp", format="WEBP", lossless=True, method=6)
print("Generated original lettering and excavator with schematic crawler and restored gold baseline.")
