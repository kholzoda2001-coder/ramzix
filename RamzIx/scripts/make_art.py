"""Тасвирҳои SVG барои маҳсулоти намунавӣ (то аксҳои воқеӣ ёфт шаванд)."""
import pathlib

OUT = pathlib.Path(__file__).resolve().parents[1] / "public" / "products"


def can(c, accent, name, sub):
    return f'''<rect x="-62" y="-170" width="124" height="340" rx="22" fill="{c}"/>
<rect x="-62" y="-170" width="124" height="34" rx="14" fill="#cfd5dd"/><rect x="-62" y="136" width="124" height="34" rx="14" fill="#aeb6c1"/>
<rect x="-52" y="-120" width="12" height="230" rx="6" fill="#fff" opacity=".08"/>
<g fill="{accent}"><path d="M-30-90 -6-90 6 40-18 40z"/><path d="M-4-96 20-96 32 50 8 50z" opacity=".85"/><path d="M22-90 46-90 52 20 30 20z" opacity=".7"/></g>
<text x="0" y="96" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="19" fill="{accent}">{name}</text>
<text x="0" y="118" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#e5e7eb">{sub}</text>'''


def jar(c, accent, name, sub):
    return f'''<rect x="-95" y="-110" width="190" height="270" rx="34" fill="{c}"/>
<rect x="-95" y="-110" width="190" height="270" rx="34" fill="#fff" opacity=".12"/>
<rect x="-80" y="-165" width="160" height="62" rx="12" fill="{accent}"/>
<rect x="-80" y="-130" width="160" height="10" fill="#000" opacity=".12"/>
<rect x="-78" y="-40" width="156" height="120" rx="14" fill="#fffaf0"/>
<text x="0" y="8" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="22" fill="#7c2d12">{name}</text>
<text x="0" y="36" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#9a3412">{sub}</text>
<circle cx="0" cy="60" r="8" fill="{accent}"/>
<rect x="-80" y="-98" width="14" height="190" rx="7" fill="#fff" opacity=".25"/>'''


def sack(c, accent, name, sub):
    return f'''<path d="M-110-150 110-150 130 160-130 160z" fill="{c}"/>
<path d="M-110-150 110-150 104-118-104-118z" fill="#000" opacity=".12"/>
<path d="M-104-118 104-118" stroke="#fff" stroke-width="3" stroke-dasharray="8 6" opacity=".6"/>
<rect x="-84" y="-70" width="168" height="150" rx="14" fill="#fff"/>
<text x="0" y="-18" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="28" fill="{accent}">{name}</text>
<text x="0" y="14" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#475569">{sub}</text>
<rect x="-48" y="34" width="96" height="30" rx="15" fill="{accent}"/>
<text x="0" y="55" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="15" fill="#fff">25 КГ</text>'''


def bottle(c, accent, name, sub):
    return f'''<rect x="-18" y="-190" width="36" height="40" rx="8" fill="{accent}"/>
<path d="M-18-150 18-150 22-120C60-100 66-60 66-20L66 150Q66 170 46 170L-46 170Q-66 170-66 150L-66-20C-66-60-60-100-22-120z" fill="{c}" opacity=".92"/>
<rect x="-66" y="-30" width="132" height="110" fill="#fff"/>
<rect x="-66" y="-30" width="132" height="22" fill="{accent}"/>
<text x="0" y="30" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="22" fill="{accent}">{name}</text>
<text x="0" y="56" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#475569">{sub}</text>
<rect x="-50" y="-100" width="10" height="90" rx="5" fill="#fff" opacity=".3"/>'''


def box(c, accent, name, sub):
    return f'''<rect x="-95" y="-140" width="190" height="290" rx="12" fill="{c}"/>
<rect x="-95" y="-140" width="190" height="60" rx="12" fill="{accent}"/>
<circle cx="0" cy="-20" r="46" fill="#fff" opacity=".18"/>
<path d="M-24-20C-24-50 24-50 24-20-24 10 24 10 24-20" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
<text x="0" y="-100" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="24" fill="#fff">{name}</text>
<text x="0" y="70" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="24" fill="#fff">{sub}</text>
<text x="0" y="110" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#fff" opacity=".85">100 пакет · 200 г</text>'''


def tee(c, accent, name, sub):
    return f'''<path d="M-70-150 -25-165Q0-135 25-165L70-150 150-90 118-30 80-52V150Q80 165 65 165H-65Q-80 165-80 150V-52L-118-30-150-90z" fill="{c}"/>
<path d="M-25-165Q0-135 25-165" stroke="#000" stroke-opacity=".18" stroke-width="6" fill="none"/>
<path d="M-80-52V150M80-52V150" stroke="#000" stroke-opacity=".06" stroke-width="3"/>
<text x="0" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="22" fill="{accent}">{name}</text>'''


SHAPES = dict(can=can, jar=jar, sack=sack, bottle=bottle, box=box, tee=tee)

ITEMS = {
    "monster": ("can", "#111827", "#7ee03a", "MONSTER", "ENERGY 500 мл"),
    "monster-ultra": ("can", "#f3f4f6", "#0ea5e9", "ULTRA", "ZERO SUGAR"),
    "honey": ("jar", "#e8a317", "#d97706", "АСАЛ", "кӯҳии тоҷик"),
    "sugar": ("sack", "#e2e8f0", "#0369a1", "ШАКАР", "навъи 1"),
    "rice": ("sack", "#fef3c7", "#b45309", "БИРИНҶ", "дарозидона"),
    "water": ("bottle", "#bae6fd", "#0284c7", "ОБИ", "МИНЕРАЛӢ 1.5 л"),
    "oil": ("bottle", "#fcd34d", "#a16207", "РАВҒАН", "офтобпараст 1 л"),
    "tea": ("box", "#166534", "#14532d", "ЧОЙ", "СИЁҲ"),
    # Футболка бо чор ранг (барои намоиши вариатсияҳо)
    "tee-black": ("tee", "#1f2937", "#f3f4f6", "RAMZIX", ""),
    "tee-white": ("tee", "#f8fafc", "#1f2937", "RAMZIX", ""),
    "tee-blue": ("tee", "#2563eb", "#eff6ff", "RAMZIX", ""),
    "tee-red": ("tee", "#dc2626", "#fef2f2", "RAMZIX", ""),
}


def svg(inner, group):
    shadow = '<ellipse cx="300" cy="545" rx="190" ry="20" fill="#0f172a" opacity=".12"/>'
    if group:
        body = "".join(f'<g transform="translate({x} {y}) scale({s})">{inner}</g>' for x, y, s in [(190, 380, .78), (410, 380, .78), (300, 345, .95)])
    else:
        body = f'<g transform="translate(300 345) scale(1.18)">{inner}</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">{shadow}{body}</svg>'


for slug, (shape, c, accent, name, sub) in ITEMS.items():
    inner = SHAPES[shape](c, accent, name, sub)
    (OUT / f"{slug}.svg").write_text(svg(inner, False))
    if not slug.startswith("tee-"):
        (OUT / f"{slug}-group.svg").write_text(svg(inner, True))
print(len(ITEMS), "items ->", OUT)
