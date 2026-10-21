# ALDIWAN — PROJECT AUDIT
Status: UPDATED 2026-10-15

## 1. Overview
Cinematic storefront (HTML/CSS/JS) connected to Cloudflare Workers + D1 backend API. Admin dashboard with authentication, order management, and payment verification.

## 2. Architecture
- **Storefront**: `al-diwan/` — static HTML/CSS/JS with GSAP, Three.js, Lenis
- **Backend**: `apps/worker/` — Hono on Cloudflare Workers
- **Database**: D1 (SQLite locally) with 3 migrations
- **Shared**: `packages/shared/` — validation, totals, shipping, coupon logic
- **Admin**: `al-diwan/admin/` — protected dashboard

## 3. What Works
- Health endpoint, product listing, order creation, order tracking
- Admin auth (PBKDF2 + HMAC session tokens), order management, status transitions
- Rate limiting, CSRF protection, secure headers
- Server-side totals, shipping, coupon validation
- Idempotency keys, stock tracking, payment status separation
- Storefront connected to API with cart, checkout, tracking
- Admin dashboard with login, order list, detail, status changes

## 4. Security
- PBKDF2-SHA256 (100k iterations) for passwords
- HMAC-SHA256 signed session tokens (12h expiry)
- HttpOnly + SameSite=Lax cookies
- Rate limiting on login (10/min), orders (20/min), tracking (30/min)
- CSRF protection on admin mutations
- Parameterized D1 queries throughout
- Zod validation on all inputs
- No stack traces leaked to clients

## 5. Data Safety
- Draft products hidden from public API
- Null prices = not purchasable
- Stock tracked with restoration on cancel
- Immutable order item snapshots
- Tracking tokens stored as SHA-256 hashes only
- `aldiwan_orders_v1` localStorage preserved

## 6. Remaining Work
- Product management endpoints (CRUD)
- Shipping zone management UI
- Coupon management UI
- Review moderation
- Payment verification webhook
- Production deployment (CORS_ORIGIN, SESSION_SECRET)
- Image optimization (WebP/AVIF)
- SEO/PWA files (robots, sitemap, manifest)
- Legal pages
