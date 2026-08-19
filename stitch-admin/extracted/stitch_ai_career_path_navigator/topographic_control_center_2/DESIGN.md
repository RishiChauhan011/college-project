---
name: Topographic Control Center
colors:
  surface: '#f6fafe'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f8'
  surface-container: '#eaeef2'
  surface-container-high: '#e5e9ed'
  surface-container-highest: '#dfe3e7'
  on-surface: '#171c1f'
  on-surface-variant: '#464554'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#edf1f5'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f6fafe'
  on-background: '#171c1f'
  surface-variant: '#dfe3e7'
  status-success: '#10b981'
  status-warning: '#f59e0b'
  status-error: '#ef4444'
  waypoint-active: '#6366f1'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.02em
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 260px
  topbar-height: 56px
  gutter: 20px
  container-padding: 24px
  metric-gap: 12px
  row-height-dense: 40px
  row-height-standard: 56px
---

## Brand & Style

The design system evolves into a **Control Center** aesthetic, tailored for high-stakes administrative oversight and analytical precision. It maintains the visionary "Topographic" narrative while shifting the emotional response from "exploration" to "total situational awareness."

The visual style is **Silk Neomorphism**, characterized by a refined, professional finish that avoids the bulbous "clay" look of early soft UI. It emphasizes a "Precision Engineering" feel through high information density, crisp monospaced data readouts, and a systematic layout. The interface should feel like a high-end physical console—tactile, responsive, and meticulously organized.

- **Professionalism:** High-density layouts with clear visual hierarchies.
- **Analytical Depth:** Use of monospaced fonts and technical markers to signify accuracy.
- **Systemic Flow:** Persistent navigation and structured metric readouts ensure the operator is never lost in the data landscape.

## Colors

The color palette is optimized for a **Light Mode** professional environment, prioritizing legibility and long-term ocular comfort.

- **Primary Action (#6366f1):** The "Waypoint" color, used exclusively for primary calls-to-action, active navigation states, and critical path highlights.
- **Surface Strategy:** The UI uses a "Silk" foundation of `#eef2f6`. Depth is achieved through a multi-tonal white and grey system rather than saturation. 
- **Data Neutrality:** Grays are slightly blued (Slate) to maintain a modern, technical feel.
- **Semantic Feedback:** Status indicators (Success, Warning, Error) are used with a 10% opacity background tint and 100% opacity text/icon to ensure they stand out without breaking the neomorphic depth.

## Typography

The typography system is divided into three functional pillars:

1.  **Wayfinding (Plus Jakarta Sans):** Used for page headers and section titles. It provides a modern, geometric clarity.
2.  **Narrative (Inter):** Used for descriptive text, helper text, and standard UI labels. Its neutral character ensures it doesn't compete with data.
3.  **Analytical (JetBrains Mono):** Reserved for all metrics, table data, timestamps, and status labels. This distinguishes "hard facts" from "interface guidance."

**Mobile Scaling:** Headlines scale down by 20% on mobile devices, while data-sm remains constant at 12px to ensure technical legibility.

## Layout & Spacing

The layout is a **Persistent Fixed-Grid** system designed for a desktop-first administrative experience.

- **Navigation Architecture:** A fixed 260px sidebar provides the primary topographic hierarchy. A compact 56px top bar houses global search, notifications, and breadcrumbs.
- **Grid System:** A 12-column grid with 20px gutters. To increase density, the standard spacing unit is based on a 4px rhythm, but with tighter internal paddings (e.g., 12px instead of 16px) for data modules.
- **Breakpoints:**
  - **Desktop (1280px+):** Full sidebar and multi-column analytical dashboard.
  - **Tablet (768px - 1279px):** Sidebar collapses to icons only (64px). Tables use horizontal scroll.
  - **Mobile (<767px):** Bottom navigation or hamburger menu. Dashboard widgets stack vertically with 16px horizontal margins.

## Elevation & Depth

This system uses "Tonal Topography" to create a structured hierarchy. Unlike soft neomorphism, shadows here are tighter and less "fuzzy."

- **Level 0 (Floor):** Background (`#eef2f6`). 
- **Level 1 (Raised Dashboard Cards):** `box-shadow: 2px 2px 6px rgba(163, 177, 198, 0.4), -2px -2px 6px rgba(255, 255, 255, 0.9)`. Used for primary data widgets.
- **Level 2 (High Focus):** `box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.3), -6px -6px 12px rgba(255, 255, 255, 1)`. Used for modals and dropdown menus.
- **Inset (Control Surface):** `box-shadow: inset 2px 2px 5px rgba(163, 177, 198, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.7)`. Used for input fields, search bars, and "depressed" active states.
- **Data Separation:** Tables use subtle 1px `outline-variant` borders on the bottom of rows instead of alternating colors to keep the "Silk" surface clean.

## Shapes

The roundedness is dialed back to **Soft (Level 1)** to maintain a more professional, industrial aesthetic suitable for an Admin Panel.

- **Buttons & Inputs:** 0.25rem (4px) to feel precise and sharp.
- **Cards & Dashboard Widgets:** 0.5rem (8px) for a modern but structured container feel.
- **Status Indicators/Pills:** 999px (full radius) to distinguish them as floating, interactive, or status-driven elements within the rigid grid.

## Components

### Refined Tables
Tables are the core of the admin panel. Use `label-caps` for headers. Rows should be `surface-bright` on hover with a 2px `primary-color` vertical accent on the left edge. Cells containing numbers must use `data-md` for alignment.

### Metric Readouts
Metric cards feature a large `data-lg` value and a small `label-caps` title. Include a "Sparkline" graphic using a 1.5px stroke in `primary-color` or `status-success` to show trends without cluttering the UI.

### Navigation Sidebar
The sidebar is a Level 1 raised surface. Active links use the "Inset" (sunken) shadow style with `primary-color` text and a subtle icon glow.

### Analytical Charts
Chart areas should be treated as "Valleys"—using the Inset shadow profile. This makes the data appear as if it is being projected onto a recessed screen within the dashboard.

### Feedback & States
- **Skeleton States:** Use a shimmering gradient from `surface-dim` to `surface-bright`.
- **Status Indicators:** Small 8px circular dots next to `data-sm` text.
- **Buttons:** Primary buttons use a flat `primary-color` fill with white text. Secondary buttons use the Level 1 Raised neomorphic style.