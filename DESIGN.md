# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Ruhige, aufgeräumte Arbeitsoberfläche mit hellgrauem Hintergrund und kühlem Blau als Akzent – zurückhaltend wie Linear. Klare Typografie und großzügige Abstände stellen die Kanban-Karten in den Vordergrund.

## Colors

- `--color-bg`: **#F5F5F7**
- `--color-fg`: **#1A1A2E**
- `--color-accent`: **#3B5CCC**
- `--color-border`: **#E0E0E6**
- `--color-muted`: **#8E8E9A**
- `--color-surface`: **#FFFFFF**
- `--color-danger`: **#D93B48**
- `--color-success`: **#2D8A4E**
- `--color-warning`: **#E09B2D**

## Typography

- `font_family`: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif
- `heading_weight`: 600
- `body_weight`: 400
- `size_scale`: 13px/14px/16px/20px/28px (caption/body/h5/h4/h3)

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-pill`: 999px

## Components

### Button (Primary)

padding 10px 20px, radius md (8px), bg=accent #3B5CCC, color=#FFFFFF, font-weight 600, font-size 14px, border none, cursor pointer, min-height 44px. hover: bg #4F6DD4 (+8% lightness). active: bg #2E4BB0 (-6% lightness). disabled: opacity 0.45, cursor not-allowed, pointer-events none. focus-visible: outline 2px solid #3B5CCC, outline-offset 2px.

### Button (Secondary/Ghost)

padding 10px 20px, radius md (8px), bg=transparent, color=accent #3B5CCC, font-weight 600, font-size 14px, border 1px solid #E0E0E6, min-height 44px. hover: bg #F0F1F8, border #3B5CCC. active: bg #E2E5F4. disabled: opacity 0.45. focus-visible: outline 2px solid #3B5CCC, outline-offset 2px.

### Button (Danger)

padding 10px 20px, radius md (8px), bg=#D93B48, color=#FFFFFF, font-weight 600, font-size 14px, border none, min-height 44px. hover: bg #E0505C. active: bg #C02F3B. disabled: opacity 0.45.

### Text Input

padding 10px 14px, radius md (8px), bg=#FFFFFF, border 1px solid #E0E0E6, color=#1A1A2E, font-size 14px, font-family inherit, width 100%, min-height 44px. placeholder color=#8E8E9A. hover: border #C0C0CC. focus: border #3B5CCC, box-shadow 0 0 0 3px rgba(59,92,204,0.15), outline none. error: border #D93B48, box-shadow 0 0 0 3px rgba(217,59,72,0.15). disabled: bg #F5F5F7, color #8E8E9A.

### Card (Kanban-Karte)

bg=#FFFFFF, border 1px solid #E0E0E6, radius md (8px), padding 14px 16px, box-shadow 0 1px 2px rgba(0,0,0,0.04). hover: box-shadow 0 4px 12px rgba(0,0,0,0.08), border #C8CCD8. dragging: box-shadow 0 8px 24px rgba(0,0,0,0.14), border #3B5CCC, rotate 2deg, cursor grabbing. card-title: font-weight 600, font-size 14px, color #1A1A2E, margin-bottom 4px. card-description: font-size 13px, color #8E8E9A, line-height 1.45.

### Column (Kanban-Spalte)

bg=#EEEEF2, radius lg (12px), min-width 280px, max-width 320px, padding 12px, display flex flex-col gap 8px. column-header: font-weight 600, font-size 14px, color #1A1A2E, padding 4px 8px, display flex justify-between items-center. column-header count badge: bg #D8DAE5, color #5A5B6A, radius pill, font-size 12px, padding 1px 8px.

### Modal / Dialog

bg=#FFFFFF, radius lg (12px), padding 24px, box-shadow 0 16px 48px rgba(0,0,0,0.18), max-width 480px, width 90vw. backdrop: rgba(0,0,0,0.35) fixed fullscreen. modal-title: font-weight 600, font-size 20px, margin-bottom 16px. modal-actions: display flex gap 8px, justify-content flex-end, margin-top 24px.

### Navbar / Header

bg=#FFFFFF, border-bottom 1px solid #E0E0E6, height 56px, padding 0 24px, display flex align-items center justify-content space-between, position sticky top 0, z-index 100. logo/title: font-weight 600, font-size 18px, color #1A1A2E. user-menu: font-size 14px, color #8E8E9A, cursor pointer.

### Toast / Notification

bg=#1A1A2E, color=#FFFFFF, radius md (8px), padding 12px 20px, font-size 14px, box-shadow 0 8px 24px rgba(0,0,0,0.2), position fixed bottom 24px right 24px, z-index 1000, animate slide-in from bottom. success variant: bg #2D8A4E. error variant: bg #D93B48.

## Layout Principles

- Container: max-width 100vw, kein zentraler Container – das Board scrollt horizontal bei vielen Spalten.
- Board-Layout: display flex, flex-direction row, gap 16px, padding 24px, overflow-x auto, align-items flex-start, min-height calc(100vh - 56px).
- Breakpoints: ≥1024px (Desktop) alle Spalten sichtbar; 768–1023px (Tablet) 2–3 Spalten; <768px (Mobile) eine Spalte im Fokus, horizontales Swipen.
- Mobile-Anpassung (<768px): Navbar height 48px, padding 0 16px. Spalten full-width (min-width 100vw - 32px), snap-scroll (scroll-snap-type: x mandatory). Cards vollbreit.
- Leere Zustände mit dezentem Hinweistext (color #8E8E9A, font-size 14px, zentriert in der Spalte mit padding 24px).
- Drag & Drop: Aktive Karte erhält box-shadow und leichte Rotation (2°). Drop-Ziel-Spalte zeigt dezenten blauen Rand (border: 2px dashed #3B5CCC, radius 12px).
- Auth-Seiten (Login/Register): Zentrierte Card (max-width 400px) vor bg #F5F5F7, kein Header, Formular mit Input- und Button-Komponenten.
