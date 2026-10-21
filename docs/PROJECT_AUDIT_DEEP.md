# ALDIWAN — DEEP PROJECT AUDIT
Generated: 2026-10-15 00:15:41

## 1. Stack
- Static cinematic app: HTML/CSS/Vanilla JS
- Anim: GSAP 3.12.5 + ScrollTrigger, Lenis (local js/vendor/lenis.min.js)
- 3D: Three.js 0.160.0 (CDN)
- State: localStorage (aldiwan_cart_v1, aldiwan_orders_v1)
- Checkout: WhatsApp (01028593440) + local orders
- RTL Arabic, mobile-first

## 2. Files
- index.html (28KB), styles.css (36KB), app.js (39KB), brand.js (2.4KB)
- data/products.json (small), data/reviews.json ([])
- assets 20 files (large PNGs 4–5MB)

## 3. Strengths
- Solid cinematic UX, reduced-motion respected, Lenis local, clean cart/checkout flow, RTL correct

## 4. Gaps (Prod)
- No backend/DB (orders authoritative client-side only)
- No server validation/totals, no auth/admin, no migrations
- SEO/PWA missing (robots/sitemap/manifest/sw/og)
- Images heavy (WebP/AVIF + lazy)
- No payments real, shipping/coupons configurable, reviews moderation
- Legal pages missing

## 5. Recommendation
Hybrid: keep storefront in al-diwan/ (preserve design), add apps/worker (Hono + D1 + Zod) + packages/shared/validation, migrations, .env.example, tests. Incremental, preserve localStorage v1, no destructive rewrites.
