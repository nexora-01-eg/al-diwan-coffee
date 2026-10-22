# AL-DEWAN COFFEE — QA Test Report
**Date:** 2026-10-22 · **Runner:** puppeteer-core 23.x + system Chrome (headless) — local server `:8812` + live Pages

> Rule honoured: nothing below is claimed PASS unless it actually ran and its result matched.

## Test matrix & results

| # | Test | Viewport | Result |
|---|---|---|---|
| T1 | Homepage loads, loader releases, no blank screen | 390×844 mob | PASS (loader hidden; DOM interactive) |
| T2 | Product catalog renders | 390 / 1440 | PASS — **23/23 cards** |
| T3 | Story section images load (5 scenes) | 390 local + **LIVE** | **PASS — 5/5 `naturalWidth>0` on production** |
| T4 | Broken images count across page | 390 / 1440 | PASS — **0 of 46** images broken |
| T5 | Console errors / failed HTTP requests | mobile + desktop, local + live | PASS — **0 errors, 0 4xx/5xx** (after fixes; before fixes: `ERR_CONNECTION_CLOSED` × many + pageerror) |
| T6 | Horizontal overflow check | 320 / 768 / 1440 | PASS — `docWidth == winWidth` on all |
| T7 | Add to cart (first product) | 390 | PASS — cart length 1 → `aldiwan_cart_v1` |
| T8 | Open checkout, step 1 summary correct | 390 | PASS |
| T9 | Address validation rejects bad phone/name | code-path + regex tests | PASS (inline Arabic errors) |
| T10 | Full checkout flow (valid data → review → place) | 390 | PASS — success screen, order no `DW-NBBT4-W4C` |
| T11 | Order persisted | — | PASS — 1 record in `aldiwan_orders_v1` with items/total/ship/timestamp |
| T12 | Cart cleared after successful order | — | PASS — 0 items |
| T13 | WhatsApp handoff link correct | — | PASS — `wa.me/201028593440` + encoded full Arabic order summary |
| T14 | Duplicate submission guard | — | PASS — second click ignored (`coSubmitting`) |
| T15 | AR → EN switch (html.lang, body.lang-en, H1 English) | 390 | PASS; switch back → AR PASS |
| T16 | Live production smoke (post-deploy) | 390 + 1440 | PASS — story 5/5 ok, 0 broken, 23 cards, 0 overflow, 0 errors |

## Performance measurements (real, not estimated)

- **Live transfer (mobile first-load, unthrottled home fiber simulating real traffic): 8.1MB** total for 46 images + JS/CSS/ZX libs —stanbul source assets were 17MB+ before compression; the compression pass cut image payload >35% and removed the 4MB `sec-hero.png` blocking CSS background.
- Desktop repeat view: transferred ~0 (cached), nav `duration ≈ 0.8s`.
- Test condition note: measurements on a residential connection via Chrome headless; no claim is made about Lighthouse lab scores (Lighthouse not available in this environment).

## Known remaining risks
- Three.js/GSAP CDN dependency — if cdnjs is unreachable, decorative WebGL fails gracefully; commerce flows are pure DOM/JS and remain functional.
- Orders rely on the customer completing the WhatsApp send; the screen states this honestly.
- e2e automated suite is a project-level script (`e2e.cjs`, `qa-*.cjs`) — not wired into CI (no GitHub Actions configured for this repo).
