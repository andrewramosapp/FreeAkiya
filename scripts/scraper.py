#!/usr/bin/env python3
"""
CheapAkiya Listing Scraper
Scrapes new akiya listings from public sources and outputs formatted data
ready to be added to lib/listings.ts

Sources covered:
- Old Houses Japan (oldhousesjapan.com/all)
- AllAkiyas.com
- [Future] Japanese municipal akiya banks by region

Usage:
  python3 scraper.py                    # Scrape all sources
  python3 scraper.py --source ohj       # Old Houses Japan only
  python3 scraper.py --max-price 10000  # Filter by max USD price
  python3 scraper.py --output json      # Output as JSON
"""

import argparse
import json
import re
import urllib.request
import urllib.parse
from html.parser import HTMLParser
from typing import Optional

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

USD_PER_JPY = 0.0067  # approximate rate, update periodically


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")


# ─────────────────────────────────────────────
# OLD HOUSES JAPAN SCRAPER
# ─────────────────────────────────────────────

class OHJParser(HTMLParser):
    """Parse listing cards from oldhousesjapan.com/all"""

    def __init__(self):
        super().__init__()
        self.listings = []
        self.current = {}
        self._in_list = False
        self._in_item = False
        self._capture_alt = False
        self._img_count = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        href = attrs.get("href", "")
        src = attrs.get("src", "")
        alt = attrs.get("alt", "")

        if tag == "a" and "/properties-2/" in href:
            if self.current:
                self.listings.append(self.current)
            self.current = {"url": "https://www.oldhousesjapan.com" + href, "images": []}
            self._img_count = 0

        if tag == "img" and src and "cdn.prod.website-files.com" in src:
            ext = src.lower()
            if any(ext.endswith(e) for e in [".jpg", ".jpeg", ".png"]) or any(f in src for f in ["jpeg", "jpg", "png"]):
                if ".svg" not in src and alt and len(alt) > 15 and self.current:
                    if self._img_count == 0:
                        self.current["image"] = src
                        self.current["description"] = alt
                    self._img_count += 1

    def handle_endtag(self, tag):
        pass

    def handle_data(self, data):
        data = data.strip()
        if not data or not self.current:
            return

        # Detect price patterns like "$640" or "$1,281"
        price_match = re.match(r"^\$[\d,]+$", data)
        if price_match:
            self.current["price_usd"] = data

        # Detect bedroom count
        bed_match = re.match(r"^(\d+)$", data)
        if bed_match and "beds" not in self.current:
            val = int(bed_match.group(1))
            if 1 <= val <= 15:
                self.current["beds"] = val

        # Detect size in sq ft
        sqft_match = re.match(r"^([\d,]+)$", data)
        if sqft_match and "size" not in self.current:
            val = data.replace(",", "")
            if 400 <= int(val) <= 10000:
                self.current["size"] = f"{data} sq ft"

        # Location hint from description
        if "location" not in self.current and self.current.get("description"):
            desc = self.current["description"]
            for prefecture in ["Hokkaido", "Niigata", "Nagasaki", "Ehime", "Kyoto",
                                "Toyama", "Miyazaki", "Fukushima", "Shimane", "Tottori",
                                "Shiga", "Nara", "Ibaraki", "Chiba"]:
                if prefecture in desc:
                    self.current["prefecture"] = prefecture
                    break


def scrape_ohj(max_price_usd: int = 15000) -> list:
    """Scrape Old Houses Japan listings page"""
    print("Scraping Old Houses Japan...")
    try:
        html = fetch("https://www.oldhousesjapan.com/all")
    except Exception as e:
        print(f"  Error: {e}")
        return []

    # Extract listing data from page
    listings = []

    # Find all listing links with their image and description
    pattern = r'href="(/properties-2/[^"]+)"[^>]*>.*?<img[^>]+src="(https://cdn\.prod\.website-files\.com/[^"]+(?:jpeg|jpg|png)[^"]*)"[^>]+alt="([^"]{20,})"'
    matches = re.findall(pattern, html, re.DOTALL)

    # Find prices separately
    price_pattern = r'\$(\d{1,3}(?:,\d{3})*)'

    for path, img_src, alt in matches:
        url = "https://www.oldhousesjapan.com" + path
        slug_base = path.replace("/properties-2/", "").strip("/")

        # Try to extract price from the description text
        price_usd = None
        price_match = re.search(r'\$(\d{1,3}(?:,\d{3})*)', alt)
        if price_match:
            price_usd = int(price_match.group(1).replace(",", ""))

        # Extract prefecture from alt text
        prefecture = "Japan"
        for pref in ["Hokkaido", "Niigata", "Nagasaki", "Ehime", "Kyoto", "Toyama",
                     "Miyazaki", "Fukushima", "Shimane", "Tottori", "Shiga",
                     "Nara", "Ibaraki", "Chiba", "Tokyo", "Osaka", "Hiroshima",
                     "Nagano", "Fukui", "Gunma"]:
            if pref in alt:
                prefecture = pref
                break

        listing = {
            "slug": slug_base,
            "name": alt[:80] + ("..." if len(alt) > 80 else ""),
            "prefecture": prefecture,
            "image": img_src,
            "url": url,
            "price_usd": price_usd,
            "source": "Old Houses Japan",
        }

        if price_usd is None or price_usd <= max_price_usd:
            listings.append(listing)

    print(f"  Found {len(listings)} listings (max ${max_price_usd:,})")
    return listings


# ─────────────────────────────────────────────
# ALLAKIYAS SCRAPER
# ─────────────────────────────────────────────

def scrape_allakiyas(max_price_jpy: int = 1500000) -> list:
    """Scrape AllAkiyas.com for cheap listings"""
    print("Scraping AllAkiyas.com...")
    try:
        html = fetch("https://www.allakiyas.com/properties.php?for_sale=1")
    except Exception as e:
        print(f"  Error: {e}")
        return []

    listings = []

    # Extract property cards
    # Look for price pattern USD $X,XXX (¥X,XXX,XXX)
    card_pattern = r'USD \$([\d,]+) \(¥([\d,]+)\).*?<strong>([\d,]+ m²).*?<strong>([\d,]+ m²).*?Built.*?<strong>(\d{4})'
    price_pattern = r'USD \$([\d,]+) \(¥([\d,]+)\)'
    link_pattern = r'href="(https://www\.allakiyas\.com/properties\.php\?id=[^"&]+)'

    prices = re.findall(price_pattern, html)
    links = re.findall(link_pattern, html)

    for i, (usd, jpy) in enumerate(prices[:len(links)]):
        usd_val = int(usd.replace(",", ""))
        jpy_val = int(jpy.replace(",", ""))
        if usd_val <= max_price_jpy * USD_PER_JPY:
            listing = {
                "price_usd": usd_val,
                "price_jpy": jpy_val,
                "url": links[i] if i < len(links) else "",
                "source": "AllAkiyas.com",
            }
            listings.append(listing)

    print(f"  Found {len(listings)} listings under ¥{max_price_jpy:,}")
    return listings


# ─────────────────────────────────────────────
# MUNICIPAL AKIYA BANK SCRAPER (FRAMEWORK)
# Future: add per-prefecture scrapers
# ─────────────────────────────────────────────

MUNICIPAL_BANKS = {
    "Hokkaido": [
        {"name": "Sapporo Akiya Bank", "url": "https://www.city.sapporo.jp/toshi/akiya/"},
        {"name": "Hokkaido Prefecture", "url": "https://www.pref.hokkaido.lg.jp/"},
    ],
    "Niigata": [
        {"name": "Niigata Prefecture", "url": "https://www.pref.niigata.lg.jp/"},
    ],
    "Kyoto": [
        {"name": "Kyoto Prefecture", "url": "https://www.pref.kyoto.jp/"},
    ],
    "Nagasaki": [
        {"name": "Nagasaki Prefecture", "url": "https://www.pref.nagasaki.jp/"},
    ],
    "Ehime": [
        {"name": "Ehime Prefecture", "url": "https://www.pref.ehime.jp/"},
    ],
    # Add more prefectures as we build them out
}


def scrape_municipal_bank(prefecture: str) -> list:
    """
    Placeholder for municipal akiya bank scraping.
    Each prefecture needs its own scraper due to different site structures.
    Most are in Japanese — will need translation layer.
    """
    banks = MUNICIPAL_BANKS.get(prefecture, [])
    if not banks:
        print(f"  No municipal bank scraper for {prefecture} yet")
        return []

    print(f"  Checking {len(banks)} municipal bank(s) for {prefecture}...")
    # TODO: Build individual scrapers per prefecture
    # Priority order based on akiya density:
    # 1. Tokushima (highest vacancy rate ~21%)
    # 2. Wakayama (~20%)
    # 3. Yamanashi (~20%)
    # 4. Kagoshima (~19%)
    # 5. Kochi (~18%)
    return []


# ─────────────────────────────────────────────
# OUTPUT FORMATTERS
# ─────────────────────────────────────────────

def format_as_typescript(listings: list) -> str:
    """Format scraped listings as TypeScript ready to paste into lib/listings.ts"""
    lines = []
    for l in listings:
        slug = re.sub(r'[^a-z0-9-]', '-', l.get('slug', 'unknown').lower())[:50]
        slug = re.sub(r'-+', '-', slug).strip('-')
        price = f"${l.get('price_usd', 0):,}"
        name = l.get('name', 'Unknown Property')[:80]
        prefecture = l.get('prefecture', 'Japan')
        img = l.get('image', '')
        url = l.get('url', '')

        lines.append(f"""  {{
    slug: "{slug}",
    price: "{price}", priceNum: {l.get('price_usd', 0)}, priceJPY: "¥{l.get('price_jpy', '?'):,}" if isinstance(l.get('price_jpy'), int) else "TBD",
    name: "{name}",
    city: "TBD", prefecture: "{prefecture}", region: "TBD",
    beds: 0, size: "TBD", built: "TBD", parking: "TBD",
    notes: "{name}",
    isPremium: true,
    tags: ["{prefecture.lower()}"],
    images: ["{img}", "{img}", "{img}"],
  }},""")

    return "\n".join(lines)


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="CheapAkiya listing scraper")
    parser.add_argument("--source", choices=["ohj", "allakiyas", "municipal", "all"], default="all")
    parser.add_argument("--max-price", type=int, default=15000, help="Max price in USD")
    parser.add_argument("--prefecture", type=str, help="Prefecture for municipal bank scraping")
    parser.add_argument("--output", choices=["json", "typescript", "summary"], default="summary")
    args = parser.parse_args()

    all_listings = []

    if args.source in ("ohj", "all"):
        all_listings += scrape_ohj(max_price_usd=args.max_price)

    if args.source in ("allakiyas", "all"):
        all_listings += scrape_allakiyas()

    if args.source in ("municipal", "all") and args.prefecture:
        all_listings += scrape_municipal_bank(args.prefecture)

    print(f"\n{'='*50}")
    print(f"TOTAL: {len(all_listings)} listings found")
    print(f"{'='*50}\n")

    if args.output == "json":
        print(json.dumps(all_listings, indent=2))
    elif args.output == "typescript":
        print(format_as_typescript(all_listings))
    else:
        for l in all_listings:
            price = f"${l.get('price_usd', '?'):,}" if isinstance(l.get('price_usd'), int) else "Price unknown"
            print(f"  {price:>10} | {l.get('prefecture', 'Unknown'):12} | {l.get('name', '')[:60]}")
            print(f"             URL: {l.get('url', '')[:70]}")
            print()


if __name__ == "__main__":
    main()
