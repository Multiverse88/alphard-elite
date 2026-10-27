# Changelog


## 2026-10-27 — Self-hosted CMS & centralized site data

- Move all landing copy, SEO/JSON-LD metadata, navigation, facility pillars, media gallery items/labels, numeric pricing, booking form/message labels, footer/legal notes, and 404 copy into `src/data/site.json`.
- Route all WhatsApp links and Rupiah formatting through `src/data/contact.ts` using `siteData.contact.whatsappNumber`.
- Add `/admin/` CMS (`public/admin/index.html`, `cms-server.ts`) with standard username/password login (`HttpOnly` signed session cookie) and automatic static site rebuild on save.

## 2026-10-21 — Black & silver luxury redesign

- Palette follows the logo: near-black surfaces (`ink-*`) with silver (`silver-*`) as the single accent; metallic gradient for primary buttons. Logo shown in original silver (no filter).
- Typography: Cormorant Garamond (display) + Outfit variable (body), self-hosted woff2 under `public/assets/fonts` with OFL licenses. Old Outfit TTFs removed.
- Hero with spotlight + outlined `ALPHARD` wordmark; spec bar; facility pillars I–III with offset frames; bento gallery (wide profile video, tall reels); pricing cards using brochure facts (normal price, all-in items) — brochure images removed; booking split into summary/total + fields (mobile order: intro → fields → total); typographic service list; image-backed closing CTA; film grain overlay; CSS scroll-driven reveals (reduced-motion respected).
- Dark native form controls (`color-scheme: dark`, explicit option colors). Measured contrast: dropdown/options 17.15:1, body text ≥ 7.3:1, smallest labels ≥ 5.3:1.
- Verified: build; 320–1440px without horizontal overflow; mobile menu; date validation; 3-day estimate Rp 7.500.000 in WhatsApp message (not sent); gallery keyboard open/Escape/focus return with video playback; production load 0 MP4 requests (~354KB transferred); 404 return.

## 2026-10-21 — Landing page redesign

- Preserve Astro static output, React islands, and Tailwind v4. Use local Outfit fonts with their SIL OFL license, white/gray surfaces, and a muted green accent.
- Replace the long centered hero and uniform feature cards with a split hero and alternating facility rows. Preserve source photos, videos, prices, and WhatsApp contact.
- Add mobile navigation, current-section indication, skip link, focus styles, reduced-motion support, inline privacy/reservation information, and a branded 404 page.
- Use native gallery dialogs with keyboard access, focus return, on-demand video loading, and loading/error feedback.
- Label booking controls, expose passengers for every service, validate the travel date, and distinguish estimates from confirmed bookings. Disable controls until hydration so early interactions cannot silently lose state. Load islands within 600px of the viewport; render the floating contact link without hydration.

### Verification

`bun run build` produces `dist/index.html` and `dist/404.html`.

Browser smoke checks on dev and production preview: responsive widths 320–1440px without horizontal overflow; mobile menu closes on navigation; empty/past dates rejected; two-day and three-day estimates are Rp 5.000.000 and Rp 7.500.000; drop-off/custom service transitions; WhatsApp URL preserves recipient, passengers, pickup punctuation, and estimate (no message sent); gallery Enter/Escape/focus restoration; image opening and actual video playback; 404 return navigation. Initial production load makes no MP4 requests. Sampled form text contrast is 16.03:1 and primary-button contrast is 9.69:1. Video request cancellation on closing its dialog is expected.

Run locally with `bun run dev`. Production build: `bun run build`; preview: `bun run preview`. No animation framework, tracking, or cookie storage added. Canonical production hostname and commercial terms must be confirmed before deployment; the existing canonical hostname is not verified by this redesign.
