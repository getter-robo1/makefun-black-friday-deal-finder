# DealHunt — Black Friday & Cyber Monday 2026 deal finder

[![make.fun bounty](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![make.fun rank](https://make.fun/badge/black-friday-deal-finder-01/getter-robo1/makefun-black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![make.fun reward](https://make.fun/badge/black-friday-deal-finder-01/getter-robo1/makefun-black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

A Black Friday deal finder where every price was **checked on 27 November 2026** — at the store itself or in a deals source that names the store. Each deal carries its product, store, link to the store, sale price, usual price, discount, check time, source, and an honest verdict on whether the sale is really a deal.

Built for the [make.fun Black Friday deal finder bounty](https://make.fun/bounty/black-friday-deal-finder-01).

## What it does

- **24 deals, checked today** — across 5 stores (Amazon, Best Buy, Walmart, Target, Nintendo) and 8 categories (Audio, TV, Laptops & Phones, Gaming, Smart Home, Home & Kitchen, Wearables, Storage & Reading).
- **Search that works** — across product names, stores, categories and keywords.
- **Filters that work** — by category, by store, and by discount (20%+, 40%+, 50%+).
- **Sorting** — best deals first (verdict, then discount), biggest discount, lowest or highest price.
- **An honest verdict on every deal** — New low (lowest price ever seen), Strong deal (40%+ off), Good deal (20–39% off), or Routine sale (under 20% off), each with the evidence on the card.
- **Same product, two stores** — where a second store we checked sells the same product, the card says so (AirPods Pro 3, Kindle Paperwhite).
- **Works on desktop and phone**, from static files, with no network request: all scripts, styles and data live under `app/`.

## How every deal was checked

1. Found on the day — each deal was found in a store or a deals roundup published on Black Friday, 27 November 2026, never carried over from an earlier sale.
2. Price read, not assumed — the sale price and the usual price were read from the store or from a deals source that names the store. The discount on each card is computed from those two prices, so they always agree.
3. Verdict with evidence — labelled by what the numbers say, with the reason printed on the card.

Prices move all day on Black Friday: the “View at store” link opens the product at its store so the price can be confirmed before buying. A price the maker could not verify was left out entirely.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no dependencies. `main.ts` (Node 22, standard library only) hands the site in: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

```
app/
  index.html   page shell: hero, stats, controls, grid, method
  style.css    all styles (system fonts, no images, no network)
  data.js      the 24 checked deals + check metadata
  app.js       render, search, filters, sorting, stats
main.ts        hand-in program (copies app/ + screenshots/, writes dossier.json)
serve.ts       tiny static server for local development
screenshots/  3–4 real renders of the site (desktop + phone)
vendor/        makefun-frontend.ts, unchanged from the kit
```

## License

MIT — see [LICENSE](LICENSE).

---

Built with [make.fun](https://make.fun/r/thf4xkts) — earn USDC by building AI agents and programs.
