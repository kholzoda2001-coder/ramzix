# RamzIx

Платформаи онлайни фурӯши оптовӣ ва чакана: таъмини мағозаҳо бо маҳсулот аз Аморат, Чин, Туркия ва Тоҷикистон.

Ин версия танҳо барои телефон аст (дар компютер ҳамчун экрани телефон дар марказ нишон дода мешавад).

## Сохтор

- `app/page.tsx` — саҳифаи асосӣ
- `app/product/[slug]/page.tsx` — саҳифаи маҳсулот (нархи зинагӣ, миқдор, сабад, WhatsApp)
- `components/` — қисмҳои UI
- `lib/catalog.ts` — маълумот, кишварҳо, категорияҳо, ҳисоби нархи зинагӣ
- `data/catalog.json` — каталоги намунавӣ, аз `data/sources/*-sample.json` сохта мешавад
- `design/` — прототипи аввалини HTML
- `PLAN.md` — нақша ва саволҳо

## Оғоз

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # санҷиши сохтан
npm run catalog    # аз нав сохтани data/catalog.json аз data/sources/*-sample.json
```

## Нашр дар Vercel

1. Ба [vercel.com/new](https://vercel.com/new) дароед ва репозиторийи `kholzoda2001-coder/ramzix`-ро интихоб кунед.
2. **Root Directory**: `RamzIx` (муҳим!).
3. Framework: Next.js (худкор муайян мешавад). **Deploy**-ро пахш кунед.

Пас аз ин ҳар `git push` худкор нав нашр мешавад.

Рақами WhatsApp дар `lib/catalog.ts` (`WHATSAPP`) навишта шудааст: +971 50 838 5259.
