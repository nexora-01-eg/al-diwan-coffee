# AL-DEWAN COFFEE — Production Readiness Audit
**Date:** 2026-10-22 · **Auditor:** Automated QA mission (Chrome headless via puppeteer-core + local HTTP server + live GitHub Pages)
**Live:** https://nexora-01-eg.github.io/al-diwan-coffee/ · **Repo:** nexora-01-eg/al-diwan-coffee (main)

---

## 1. Architecture (as inspected)

| Layer | Technology | Location |
|---|---|---|
| Frontend | Static HTML/CSS/JS (no build step) | `al-diwan/` |
| Product data | `PRODUCTS[]` const in `app.js` (23 products × sada/mahwag × 250g/500g/1kg) | `al-diwan/app.js` |
| Reviews | `al-diwan/data/reviews.json` (currently empty — honest empty state, no fabricated reviews) | |
| Orders (current) | `localStorage.aldiwan_orders_v1` + WhatsApp `wa.me/201028593440` handoff | `app.js` §11 |
| Backend (exists, NOT deployed) | Hono + D1 + R2 Worker + admin panel | `apps/worker/`, `al-diwan/admin/` |
| Hosting | GitHub Pages (static, no server runtime) | |

## 2. Confirmed defects found & fixed this run

| # | Defect | Severity | Status |
|---|---|---|---|
| D1 | Story section images never rendered (no `picture/img` injected into `.scene-ph`; two competing injection systems) | High — UX | **FIXED + verified in browser (5/5 loaded on live)** |
| D2 | `sec-hero.png` 4.1MB + `logo-full.png` 2.1MB + gallery 260–366KB each → `ERR_CONNECTION_CLOSED` on real networks, glitchy loading | High — perf/stability | **FIXED: full asset compression pass (17MB→11.4MB source set; sec-hero 4,109KB→82KB webp; logo 2,126KB→17KB webp; all gallery/story/products re-encoded)** |
| D3 | Checkout step-3 HTML interpolated raw user input (`ship.name/phone/addr/note`) → DOM XSS | **Critical — security** | **FIXED: `esc()` applied to all user-controlled interpolations; validated + E2E tested** |
| D4 | No phone/name/address validation (accepted anything) | High | **FIXED: name ≥3 chars, Egyptian phone `01xxxxxxxxx` (11 digits), address ≥6 chars, inline Arabic error messages — tested** |
| D5 | Order ID `DW-`+Date.now().slice(-6) → collision-prone, not traceable | Medium | **FIXED: base36 timestamp + random suffix (e.g. `DW-NBBT4-W4C`) — tested** |
| D6 | Double-click on "تأكيد الطلب" created duplicate orders | High | **FIXED: `coSubmitting` guard + button disabled/pending state — tested** |
| D7 | Order never delivered to the business (localStorage only) — owner cannot see orders | **Critical — business** | **FIXED (fallback design): honest success screen states order is recorded AND demands WhatsApp handoff to the brand (`wa.me/201028593440` with machine-readable full order summary: products/quantities/weights/prices/total/name/phone/city/address/notes/ COD); explicit copy that opening WhatsApp ≠ order received until the customer sends. Server-side delivery supported via `window.DIWAN.apiBase` + `/api/orders` (worker) when deployed** |
| D8 | Cart subtotal/total unchanged logic was correct, but ship note duplicated gateway text — no defect found (VERIFIED by calculation test: v.price × size multiplier × qty) | Low | Verified PASS |
| D9 | Fake newsletter promise "كود خصمك: DIWAN15" (unverified offer, no redemption system exists) | Medium — integrity | **FIXED: honest "تم التسجيل، هنبلغك بالعروض الحقيقية" + duplicate-safe subscription list (`aldiwan_news_list`)** |
| D10 | Horizontal overflow risks on small screens | Medium — mobile | **FIXED: `overflow-x` guards, media queries at 1024/640/480, tested 320/768/1440 = 0px overflow** |
| D11 | Large dead assets (63.4MB unreferenced PNGs in repo — do NOT ship to customers, only repo bloat) | Low — repo | Documented; **cleanup requires owner approval** (reversible git removal, not silently done) |

## 3. Unresolved / external blockers

1. **NO trusted server receives orders in production.** The Worker (`apps/worker`) supports POST /api/orders + admin dashboard + CSV export, but it is **not deployed publicly** (needs owner's Cloudflare account authorization). Until deployed: orders arrive via WhatsApp + localStorage only → owner export not possible remotely.
2. **The 12-hour owners sheet**: requires the deployed Worker → scheduled email/CSV job. Blocked on owner credentials/deploy authorization.
3. Real Google/Facebook reviews: `data/reviews.json` is the honest path; it's empty — no schema injected, nothing invented.
4. Social links / opening hours: intentionally `null` in `config.js` until owner confirms (site shows nothing rather than inventing).
5. Shipping fee beyond Delta free-tier: shown as "يُحدّد عند التأكيد" — does not invent amounts.

## 4. Feature inventory (verified)

- ✅ 23 products, sada/mahwag variants, 250g/500g/1kg (1kg = 4×250g pack math), prices per approved list
- ✅ Cart: add (same/different variant), qty ±, remove, clear, persistence, EGP totals
- ✅ Quick view with variant/weight/price/quantity
- ✅ Checkout: 3 steps + review + validation + duplicate guard + honest success + WhatsApp handoff
- ✅ AR/EN fully switchable incl. dynamic cart/checkout; persists; RTL/LTR
- ✅ Search/filter/sort intent — present; empty-result message verified in code path
- ✅ Loader (never traps), Facebook-menu cafe section, story scenes with real photos, branches + Google Maps links, honest reviews section
- ✅ SEO: title/description/OG/canonical/schema (LocalBusiness) — see deployment checklist
- ✅ Accessibility basics: semantic landmarks, focus outlines via CSS `:focus-visible`, alt text, labels, reduced-motion opt-out

## 5. Release status

**PRODUCTION CANDIDATE** — all in-repo verified requirements pass; the single remaining essential (trusted order intake deployed on the owner's Cloudflare account) needs owner action. WhatsApp delivery works today as the business channel.
