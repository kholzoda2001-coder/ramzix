"""Каталоги намунавиро аз hosting/*-sample.json месозад -> data/catalog.json.

Нарх бо формулаи hosting/anker-plan.json ҳисоб мешавад:
  usd = нархи манбаъ × қурб + вазн × 1.2 (интиқол), баъд +10% хизмат, × 9.25 = TJS
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = pathlib.Path(__file__).resolve().parents[1] / "data" / "catalog.json"

TO_USD = {"AED": 0.27100271, "SAR": 0.26666667, "USD": 1.0}
USD_TO_TJS = 9.25
FEE = 0.10
SHIP_PER_KG = 1.2

SOURCES = [
    # файл, кишвари таъминот, категория, вазни пешфарз
    ("anker-sample.json", "ae", "audio", 0.3),
    ("noon-sample.json", "ae", "men", 0.25),
    ("shein-sample.json", "cn", "men", 0.35),
    ("trendyol-sample.json", "tr", "men", 0.25),
]


def price_tjs(price, cur, weight):
    usd = price * TO_USD[cur] + weight * SHIP_PER_KG
    return round(usd * (1 + FEE) * USD_TO_TJS)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")[:60]


def clean_title(t):
    t = re.sub(r"\s+", " ", t).strip()
    if len(t) > 80:
        t = t[:80].rsplit(" ", 1)[0] + "…"
    return t


products = []
for fname, country, cat, wdef in SOURCES:
    raw = json.loads((ROOT / "hosting" / fname).read_text())
    items = raw["eligible"] if isinstance(raw, dict) else raw
    src = fname.split("-")[0]
    for p in items:
        if not p.get("image_urls") or not p.get("sale_price"):
            continue
        w = p.get("weight_kg") or wdef
        title = p["title"]
        name, _, sub = title.partition(" | ")
        products.append({
            "slug": f"{src}-{slug(p['source_id'])}",
            "name": clean_title(name),
            "subtitle": sub.strip() or None,
            "brand": (p.get("brand") or "").replace("Anker / ", "") or None,
            "category": cat,
            "country": country,
            "source": src,
            "price": price_tjs(p["sale_price"], p["currency"], w),
            "listPrice": price_tjs(p["list_price"], p["currency"], w) if p.get("list_price") and p["list_price"] > p["sale_price"] else None,
            "weightKg": w,
            "images": p["image_urls"][:6],
            "rating": round(p["rating"], 1) if p.get("rating") else None,
            "reviews": p.get("review_count") or 0,
            "sizes": p.get("sizes") or None,
            "description": (p.get("description") or "").strip() or None,
        })

for p in products:
    if p["listPrice"] and p["listPrice"] <= p["price"]:
        p["listPrice"] = None

OUT.write_text(json.dumps(products, ensure_ascii=False, indent=1))
print(len(products), "products ->", OUT)
