# AL-DEWAN COFFEE — Deployment Checklist (GitHub Pages)

## Pre-deploy (automated portion verified)

- [x] `node --check` passes for `app.js`, `js/*.js`, `admin/admin.js`
- [x] Worker TypeScript `tsc --noEmit` clean (`apps/worker`)
- [x] Local E2E suite passes (`e2e.cjs` — see qa-test-report.md)
- [x] Asset audit: no unreferenced heavy files referenced (63.4MB legacy PNGs remain in repo but unreferenced — owner cleanup pending)
- [x] No secrets in frontend (`data/config.js` contains public contact info only)
- [x] `og:image` points to `assets/logo-og.jpg` (23KB compressed)
- [x] Canonical/OG URLs match `https://nexora-01-eg.github.io/al-diwan-coffee/`

## Deploy

- [x] `git push origin main` → GitHub Pages serves `al-diwan/` as site root
- [x] Wait for Pages build propagation (~1–10 min; cache-control 600s)

## Post-deploy verification (executed 2026-10-22)

- [x] Homepage loads, loader releases
- [x] Product catalog: 23 cards
- [x] Images: 0/46 broken; story 5/5 load
- [x] No critical console errors
- [x] Mobile layout: zero horizontal overflow at 390
- [x] Correct SEO metadata served
- [ ] **Orders to trusted backend** — requires owner to authorize deploying `apps/worker` to Cloudflare (free plan) and setting `window.DIWAN.apiBase` in `data/config.js`. Until then: WhatsApp + localStorage ordering.

## Owner actions required (external)

1. Deploy Worker: `wrangler deploy` from `apps/worker` (needs Cloudflare API token) → set `apiBase`.
2. 12-hour orders sheet: KD Worker cron or Make.com/Sheets formula — design ready, needs deploy.
3. Confirm social links + opening hours (currently honest-null on site).
4. Optional: delete unreferenced legacy PNGs (~63MB repo weight) — reversible via git.
