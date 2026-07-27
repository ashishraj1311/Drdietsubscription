# Dr Diet — Design System

Source: official `Brand Guideline Dr Diet.pdf`. Everything below is extracted directly from it — treat as fixed, not a starting point to riff on.

## Logo

- Logomark: a stylized "D" formed from a leaf + a bitten/round shape, paired with the tagline "EAT WHAT'S RIGHT" curved above it.
- Wordmark: "DR. DIET" set in the primary display font, bold, all caps.
- Full logo = symbol + wordmark lockup, used together in headers/splash; symbol alone can be used as an app icon / favicon / small-space mark.
- Logo always renders in the Primary Color (`#434E3D`) on light backgrounds. Do not recolor it to the accent yellow-green or use it on a busy/photo background without a solid-color safe area behind it.

## Color palette

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `--color-primary` | `#434E3D` | 67,78,61 | Logo, headings, primary buttons, icons, dark text |
| `--color-primary-light` | `#F5EDE1` | 245,237,225 | Page/section backgrounds, cards, warm neutral canvas |
| `--color-neutral` | `#A5AF9B` | 165,175,155 | Secondary text, borders, disabled states, muted UI |
| `--color-accent` | `#E2E573` | 226,229,115 | Highlights, badges, active/selected states, CTAs that need to pop against the primary green |

Notes for implementation:
- This is a warm, earthy, muted palette (olive green + cream + sage + chartreuse) — quite different from the bright emerald/orange scheme used in the earlier hi-fi HTML prototype. **When porting the prototype's screens, re-skin every color token to this palette; do not keep the old `#1F8A5C` / `#F2A93B` colors.**
- Because there's no dedicated "danger/error" or "success" color in the guideline, define pragmatic extensions that stay in-family rather than importing generic red/green:
  - `--color-danger`: a desaturated brick/red-brown (e.g. `#B3462C`) — used sparingly, only for real errors.
  - `--color-success`: reuse `--color-accent` (`#E2E573`) or a slightly deeper olive-gold for confirmation states, to avoid a jarring bright green that clashes with primary.
- Maintain WCAG AA contrast: `--color-primary` text on `--color-primary-light` background passes comfortably; `--color-accent` should generally be used as a background/highlight fill with `--color-primary` text on top of it, not as text color on white (contrast is too low).

## Typography

- **Primary font: Barlow** — condensed, bold, geometric sans. Use for headings, buttons, nav labels, numerals (prices), and any UI chrome. Barlow is a free Google Font — safe to use directly (`font-family: 'Barlow', sans-serif;`).
- **Secondary font: Quity** — a rounded/script display face used for accent moments (e.g. italic sub-headers like "Brand Guideline" in the source PDF). Use sparingly: taglines, empty-state illustrative copy, or a single accent word inside a hero headline — never for body copy or long-form text, and never for form labels or buttons (legibility risk). Quity is a paid/licensed display font — confirm license availability before shipping; if unavailable, substitute a rounded display font (e.g. "Fredoka" or "Baloo 2" from Google Fonts) as a visual stand-in and flag it for the user to swap once licensed.
- **Body text**: the guideline doesn't specify a separate body font. Use Barlow at regular/medium weight for body copy rather than introducing a third typeface — keeps the system to two fonts total as documented.

Suggested type scale (derive from Barlow, adjust to taste during build):
| Role | Weight | Size (approx) |
|---|---|---|
| Display / Hero | Barlow Bold | 32–40px |
| Screen title | Barlow Bold | 22–24px |
| Section header | Barlow SemiBold | 17–18px |
| Body | Barlow Regular/Medium | 14–15px |
| Caption / meta | Barlow Regular | 12–13px |
| Accent word/tagline | Quity (or substitute) | context-dependent |

## Shape & surface language

Carried forward from the validated hi-fi prototype (not brand-guideline-specified, but consistent with the guideline's rounded logo mark and soft card in the PDF layout itself):
- Generous corner radius on cards/buttons/sheets (12–20px) — matches the rounded, friendly logo shape.
- Thin 1–2px hairline borders in `--color-neutral` at low opacity rather than heavy drop shadows, to keep the earthy/organic feel instead of a glossy tech look.
- Bottom-sheet modals for contextual actions (delivery instructions, filters, payment method) — keep this pattern from the existing prototype.

## Component tokens (for implementation)

```css
:root {
  --color-primary: #434E3D;
  --color-primary-light: #F5EDE1;
  --color-neutral: #A5AF9B;
  --color-accent: #E2E573;
  --color-danger: #B3462C;
  --color-success: #E2E573;
  --color-text: #434E3D;
  --color-text-muted: #7A8570;
  --color-surface: #FFFFFF;
  --color-bg: #F5EDE1;
  --color-border: #DCD6C8;

  --font-primary: 'Barlow', sans-serif;
  --font-accent: 'Quity', 'Baloo 2', cursive;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
}
```

## Content/imagery tone

- Photography and illustration should feel natural/organic (leaf motif in the logo) — avoid stock "corporate wellness" imagery that feels sterile.
- All produced UI copy, pricing, and imagery must comply with the PRD's content constraints: **INR currency (₹) only, no beef in any dish/protein content.**
