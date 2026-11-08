---
name: Abyssal Emerald
colors:
  surface: '#081611'
  surface-dim: '#081611'
  surface-bright: '#2e3c36'
  surface-container-lowest: '#04110c'
  surface-container-low: '#101e19'
  surface-container: '#14221d'
  surface-container-high: '#1f2d27'
  surface-container-highest: '#293832'
  on-surface: '#d6e6dd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#d6e6dd'
  inverse-on-surface: '#25332e'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#45dfa4'
  on-secondary: '#003825'
  secondary-container: '#00bd85'
  on-secondary-container: '#00452e'
  tertiary: '#68dba9'
  on-tertiary: '#003825'
  tertiary-container: '#3eb686'
  on-tertiary-container: '#00422c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#68fcbf'
  secondary-fixed-dim: '#45dfa4'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#081611'
  on-background: '#d6e6dd'
  surface-variant: '#293832'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 34px
    fontWeight: '400'
    lineHeight: 42px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  gutter-mobile: 1rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses an esoteric, nocturnal literary environment tailored for deep work, poetic curation, and concentrated reading. It evokes the feeling of submerged botanical sanctuaries and dark benthic trenches lit solely by bioluminescence.

The aesthetic fuses **Tactile Editorial Minimalist** structure with **Nocturnal Glass & Tonal Layering**. It rejects aggressive commercial tropes, flat utilitarian gray-scales, and warm amber accents in favor of a monastic, emerald-drenched sanctuary. The interface recedes into absolute nocturnal composure, surfacing typography as luminous ink on treated parchment and gemstone glass.

## Colors

The palette operates under an uncompromising rule: **Zero gold, bronze, or amber presence.** All statuses, alerts, focal highlights, badges, and focus rings rely purely on spectrum shifts between luminous mint, brilliant jade, glacial sage, and pristine parchment.

### Canvas & Surfaces
- **Canvas Base (`#04110C`):** Subterranean oceanic ink. Used for base view background and root frames.
- **Canvas Raised (`#081611`):** Deep nocturnal wash for ambient sidebars and segmented regions.
- **Surface Level 1 / Spruce Container (`#101e19`):** Primary card backdrop, structured panels, and reading wells.
- **Surface Level 2 / Malachite Cell (`#162a22`):** Elevated popovers, nested items, and interactive hovering plates.
- **Surface Level 3 / Luminous Veil (`#1f392f`):** Active selections, segmented button track fills, and modal dialogues.

### Accents & Indicators
- **Primary Emerald (`#10b981`):** Primary action callouts, high-status badges, and active state cursors.
- **Luminous Mint (`#34d399`):** Accent glow highlights, text links, active radio centers, and focus rings.
- **Deep Jade (`#059669`):** Secondary buttons, subtle borders, and inactive progress bars.
- **Silvery Sage (`#a7f3d0`):** Secondary metadata highlights and soft status icons.

### Ink & Neutral Text
- **Parchment White (`#f0fdf4`):** Primary editorial typography, titles, and pure contrast reading bodies.
- **Glacial Muted (`#cbd5e1`):** Secondary prose, labels, and muted timestamps.
- **Abyssal Ghost (`#4b6358`):** Disabled states, structural dividers, and subtle lineation.
- **Border Emerald Subdued (`#133326`):** Low-contrast structural container boundaries.

## Typography

The typographical architecture juxtaposes the classical literary beauty of **Newsreader** with the rigorous, systematic utility of **Inter** and the surgical precision of **JetBrains Mono**.

- **Editorial Headlines & Literary Text (`Newsreader`):** Used for verse, collection headers, essay passages, and featured author titles. It creates an authentic print publication aura in nocturnal conditions. Italic variants are reserved for poetic fragments and stanzas.
- **Application Interface & Utilities (`Inter`):** Powers dashboard actions, navigational taxonomies, settings, and dense interactive tables.
- **Metadata & Structural Counters (`JetBrains Mono`):** Employs strict monospace clarity for edition numbering, timestamps, line numbers, word totals, and micro status pills.

## Layout & Spacing

The layout philosophy implements a **Fluid Grid with Constrained Editorial Wells**.

- **Desktop (≥ 1280px):** 12-column layout with 24px (`1.5rem`) gutters and a minimum 32px (`2rem`) outer margin. The primary reading column is strictly clamped between `68ch` and `74ch` to ensure optimal poetic line breaks and scannability.
- **Tablet (768px - 1279px):** 8-column layout with dynamic margin scaling. Sidebars collapse to rail navigation.
- **Mobile (< 768px):** 4-column layout with 16px (`1rem`) gutters and 16px (`1rem`) outer canvas padding.

Rhythm is controlled through strict vertical cadence. Component spacing follows the binary scale, where `space-md` (`1rem`) handles intra-card layout separation, and `space-xl` (`2.5rem`) establishes breath between unrelated literary movements.

## Elevation & Depth

This design system uses **Tonal Submersion and Emerald Bioluminescence** instead of standard shadow physics:

1. **Surface Strata:** Rather than shifting closer to pure white, elevated tiers accumulate mineral richness. The base sits at `#04110C`, rising to `#101e19` (Spruce), `#162a22` (Malachite), and `#1f392f` (Deep Luminous Veil).
2. **Subdued Boundaries:** Elevation layers are framed with 1px hairline borders (`#133326` or `#1b4534`), never raw drop shadows.
3. **Bioluminescent Emerald Halos:** Hovered interactive elements and active dialogs emanate an ethereal aura using tinted blurs:
   - *Elevation Card:* `box-shadow: 0 4px 24px -2px rgba(4, 17, 12, 0.8), 0 0 1px 1px #133326;`
   - *Active Modal / Floating Palette:* `box-shadow: 0 16px 40px -8px rgba(2, 8, 6, 0.95), 0 0 24px 0 rgba(16, 185, 129, 0.12), inset 0 1px 1px 0 rgba(52, 211, 153, 0.15);`

## Shapes

The shape vocabulary uses the **Soft (Level 1)** scale. It maintains a crisp, bookbinder's finish reminiscent of trimmed deckle edges and archival slips:

- Standard controls, inputs, and chips: `0.25rem` (4px).
- Literary cards, content wells, and sheets: `0.5rem` (8px).
- Modal windows and floating panels: `0.75rem` (12px).
- Circular pills are forbidden except for precise micro-indicators and count pips.

## Components

### Buttons
- **Primary:** Solid Emerald (`#10b981`) text or solid Emerald background with Ink Black text (`#04110c`), font weight 600. On hover, background shifts to Mint (`#34d399`) with an emerald aura glow (`0 0 16px rgba(16, 185, 129, 0.35)`).
- **Secondary:** Spruce dark container (`#101e19`), 1px hairline border in `#1e4738`, Parchment White text (`#f0fdf4`). On hover, background transitions to Malachite (`#162a22`) with a border brightened to Emerald (`#10b981`).
- **Ghost:** Transparent background, muted sage text (`#a7f3d0`). On hover, fills with low-alpha emerald veil (`rgba(16, 185, 129, 0.08)`).
- **Warning / Alert Alternatives:** Zero gold/yellow. Warnings are presented with high-contrast Crisp Parchment on deep malachite backgrounds outlined with luminous mint.

### Chips & Badges
- **Editorial Chips:** Deep Spruce base (`#101e19`), hairline border (`#16382b`), JetBrains Mono typography, Silvery Sage text (`#a7f3d0`).
- **Featured Badges:** Emerald background tint (`rgba(16, 185, 129, 0.15)`), Mint text (`#34d399`), 1px solid `#10b981`.

### Lists & Poetry Folios
- Alternating dividers use hairline abyssal borders (`#0d251c`).
- Stanza rows feature responsive padding with hover states elevating from Canvas to `#0c1914`.
- Active verse markers use an emerald left-border notch (2px width in `#10b981`).

### Form Elements & Inputs
- **Inputs:** Nocturnal ink canvas fill (`#04110c`), bordered by `#16382b`. Placeholder in `#4b6358`, typed text in `#f0fdf4`.
- **Focus State:** 1px solid `#34d399` outline with a 2px outer glow (`rgba(52, 211, 153, 0.2)`). No default browser blue or gold halos.
- **Checkboxes & Radios:** Spruce container frame. When selected, filled with Emerald (`#10b981`) sporting a crisp Parchment checkmark/dot (`#04110c`).

### Cards & Reading Containers
- Constructed on `#101e19` (Spruce) with outer stroke `#143528`.
- Inset header rules use subtle gradients fading from `#1b4534` to transparent.
- Card footers feature monospace metadata in `#a7f3d0`.