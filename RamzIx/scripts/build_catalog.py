"""Каталоги намунавиро аз data/sources/*-sample.json месозад -> data/catalog.json.

Дар маҳсулот НАРХИ ХАРИД (cost) бо асъори манбаъ нигоҳ дошта мешавад.
Нархи фурӯш дар сайт аз cost + ҳаққи хизмат + расонидан ҳисоб мешавад
(ниг. lib/pricing.ts ва lib/pricing-config.ts).

Диққат: costTiers (нархи миқдорӣ) ва volumeM3 дар ин ҷо НАМУНАВӣ ҳастанд,
то ки сайт нишон дода шавад. Дар версияи воқеӣ онҳо аз таъминкунанда меоянд.
"""
import json, re, pathlib

DATA = pathlib.Path(__file__).resolve().parents[1] / "data"
OUT = DATA / "catalog.json"

SOURCES = [
    # файл, кишвари таъминот, категория, вазни пешфарз (кг), ҳаҷми як воҳид (м³)
    ("anker-sample.json", "ae", "audio", 0.3, 0.0015),
    ("noon-sample.json", "ae", "men", 0.25, 0.003),
    ("shein-sample.json", "cn", "men", 0.35, 0.004),
    ("trendyol-sample.json", "tr", "men", 0.25, 0.003),
]

# намуна: ҳар қадар зиёд, нархи харид камтар
SAMPLE_TIERS = [(1, 1.0), (10, 0.93), (50, 0.87)]


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")[:60]


def clean_title(t):
    t = re.sub(r"\s+", " ", t).strip()
    if len(t) > 80:
        t = t[:80].rsplit(" ", 1)[0] + "…"
    return t


def money(x):
    return round(x, 2)


products = []
for fname, country, cat, wdef, vol in SOURCES:
    raw = json.loads((DATA / "sources" / fname).read_text())
    items = raw["eligible"] if isinstance(raw, dict) else raw
    src = fname.split("-")[0]
    for p in items:
        if not p.get("image_urls") or not p.get("sale_price"):
            continue
        name, _, sub = p["title"].partition(" | ")
        price = p["sale_price"]
        products.append({
            "slug": f"{src}-{slug(p['source_id'])}",
            "name": clean_title(name),
            "subtitle": sub.strip() or None,
            "brand": (p.get("brand") or "").replace("Anker / ", "") or None,
            "category": cat,
            "country": country,
            "source": src,
            "cost": money(price),
            "costCurrency": p["currency"],
            "costTiers": [{"min": m, "cost": money(price * f)} for m, f in SAMPLE_TIERS],
            "weightKg": p.get("weight_kg") or wdef,
            "volumeM3": vol,
            "images": p["image_urls"][:6],
            "rating": round(p["rating"], 1) if p.get("rating") else None,
            "reviews": p.get("review_count") or 0,
            "sizes": p.get("sizes") or None,
            "description": (p.get("description") or "").strip() or None,
        })

OUT.write_text(json.dumps(products, ensure_ascii=False, indent=1))
print(len(products), "products ->", OUT)
