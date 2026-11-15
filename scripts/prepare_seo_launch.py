#!/usr/bin/env python3
"""Prepare SEO launch files AFTER the official domain works.

Default mode prints a preview only. --apply writes canonical tags,
sitemap.xml, robots.txt and removes preview noindex tags.
Do not run --apply before explicit approval for public indexing.
"""
import argparse
import html
from pathlib import Path
import re
from urllib.parse import urlparse
from xml.etree.ElementTree import Element, SubElement, tostring

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ("index.html", "asphaltbau.html", "kabelbau.html")
OTHER = ("impressum.html", "datenschutz.html")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", required=True, help="Final live site origin, e.g. https://tomic-bau.de")
    parser.add_argument("--apply", action="store_true", help="Explicitly write files and turn on indexing")
    args = parser.parse_args()
    origin = args.base_url.rstrip("/")
    u = urlparse(origin)
    if u.scheme != "https" or not u.hostname or u.path or u.query or u.fragment or u.username or u.password:
        parser.error("--base-url must be an HTTPS origin without path, port credentials, query or fragment")
    if not all((ROOT / f).exists() for f in PUBLIC + OTHER):
        parser.error("Expected site pages are missing")
    canonical = {f: origin + ("/" if f == "index.html" else "/" + f) for f in PUBLIC}
    print("SEO launch plan:", canonical)
    if not args.apply:
        print("PREVIEW ONLY. noindex and domain setup remain unchanged.")
        return

    for name in PUBLIC + OTHER:
        path = ROOT / name
        data = path.read_text(encoding="utf-8")
        data, count = re.subn(
            r'<meta\s+name=["\']robots["\']\s+content=["\']noindex,nofollow["\']\s*/?>',
            '<meta name="robots" content="index,follow">',
            data,
            count=1,
            flags=re.IGNORECASE,
        )
        if count != 1:
            raise RuntimeError(f"{name}: expected preview robots tag absent")
        target = canonical.get(name, origin + "/" + name)
        link = '<link rel="canonical" href="' + html.escape(target, quote=True) + '">'
        if 'rel="canonical"' in data:
            raise RuntimeError(f"{name}: canonical tag already present; review manually")
        if "</head>" not in data:
            raise RuntimeError(f"{name}: missing head")
        data = data.replace("</head>", link + "</head>", 1)
        path.write_text(data, encoding="utf-8")

    root = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for target in canonical.values():
        SubElement(SubElement(root, "url"), "loc").text = target
    (ROOT / "sitemap.xml").write_bytes(b'<?xml version="1.0" encoding="UTF-8"?>\n' + tostring(root, encoding="utf-8") + b"\n")
    (ROOT / "robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: " + origin + "/sitemap.xml\n", encoding="utf-8")
    print("Applied launch SEO tags and generated sitemap.xml / robots.txt")
    print("Verify official domain, GitHub Pages deployment and Search Console before submitting sitemap.")

if __name__ == "__main__":
    main()
