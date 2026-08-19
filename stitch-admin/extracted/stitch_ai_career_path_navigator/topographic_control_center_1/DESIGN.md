---
name: Topographic Control Center
colors:
  surface: '#f6fafe'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f8'
  surface-container: '#eaeef2'
  surface-container-high: '#e4e9ed'
  surface-container-highest: '#dfe3e7'
  on-surface: '#171c1f'
  on-surface-variant: '#464554'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#edf1f5'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#484bd6'
  primary: '#2c2abc'
  on-primary: '#ffffff'
  primary-container: '#4648d4'
  on-primary-container: '#d1d1ff'
  inverse-primary: '#c0c1ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#004f35'
  on-tertiary: '#ffffff'
  tertiary-container: '#006a48'
  on-tertiary-container: '#90e7bb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#06006c'
  on-primary-fixed-variant: '#2e2ebe'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#9df4c8'
  tertiary-fixed-dim: '#81d8ad'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f6fafe'
  on-background: '#171c1f'
  surface-variant: '#dfe3e7'
  waypoint-active: '#6366f1'
  status-success: '#10b981'
  status-warning: '#f59e0b'
  status-error: '#ef4444'
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
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
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

The design system is an evolution of administrative oversight into a high-precision **Control Center**. It shifts from a narrative of "exploration" to one of **Total Situational Awareness**, targeting technical operators and data analysts who require high information density without cognitive fatigue.

The aesthetic follows a **Silk Neomorphism** style. This approach moves away from the bulbous, playful "claymorphism" of the past toward a refined, industrial "Precision Engineering" finish. It uses subtle tonal layering, recessed "valleys" for data visualization, and crisp monospaced accents to evoke the feel of a high-end physical console—tactile, responsive, and meticulously organized.

- **Minimalist Density:** Whitespace is used systematically to separate data modules rather than just for decoration.
- **Tactile Hierarchy:** Elements are either "Raised" (interactive/containers) or "Inset" (data inputs/recessed chart areas).
- **Professionalism:** A serious, light-mode first approach that prioritizes legibility and technical accuracy.

## Colors

The palette is optimized for professional endurance, using a "Silk" foundation that reduces glare while maintaining high contrast for data points.

- **Primary & Wayfinding:** `#4648d4` serves as the primary brand anchor, while the brighter `#6366f1` (Waypoint Active) is reserved for interactive highlights, active navigation states, and critical path indicators.
- **Surface Strategy:** Depth is achieved through a multi-tonal neutral system. The background (`#f6fafe`) provides a clean canvas, while varying levels of `surface-container` shades define the physical hierarchy of the "topographic" layout.
- **Semantic Feedback:** Success, Warning, and Error colors are used strictly for status. For high-density tables, use these colors at 100% opacity for icons/text and 10% opacity for subtle row or cell backgrounds to ensure semantic meaning is clear without overwhelming the data.

## Typography

The typography system is divided into three functional pillars to separate interface guidance from raw intelligence.

1.  **Wayfinding (Plus Jakarta Sans):** Geometric and clear, used for high-level headers and page titles to anchor the user's position within the system.
2.  **Narrative (Inter):** A neutral workhorse used for descriptive text, tooltips, and standard UI labels. It ensures that secondary information remains legible but unobtrusive.
3.  **Analytical (JetBrains Mono):** Reserved for all quantitative data, including high-density tables, timestamps, and metric readouts. The monospaced nature ensures that numbers align perfectly across rows, aiding rapid scanning and comparison.

**Mobile Scaling:** Large headlines scale down by approximately 20% on mobile devices, while `data-sm` and `label-caps` remain constant to preserve the technical legibility of charts and metrics.

## Layout & Spacing

The design system utilizes a **Persistent Fixed-Grid** layout, optimized for complex administrative tasks where consistency is paramount.

- **Navigation & Framework:** A fixed 260px left sidebar establishes the primary hierarchy. The 56px top bar is reserved for global utility actions (search, notifications, profiles).
- **Grid Strategy:** A 12-column fluid grid with 20px gutters. Internal module padding follows a strict 4px rhythm, but favors 12px increments (rather than 16px) to maximize the density of analytical views.
- **Breakpoints & Adaptation:**
  - **Desktop (1280px+):** Standard view. Data tables can span the full width or share space with "Inspection Drawers."
  - **Tablet (768px - 1279px):** The sidebar collapses to a 64px rail (icons only). Large tables utilize horizontal scrolling with pinned key columns (e.g., User Name).
  - **Mobile (<767px):** Single-column stack. High-density tables reflow into "Data Cards" to ensure monospaced metrics remain readable.

## Elevation & Depth

Hierarchy is communicated through "Tonal Topography." Shadows are tighter and less diffused than traditional neomorphism to maintain a professional, sharp aesthetic.

- **Level 0 (Floor):** The base background layer (`#f6fafe`).
- **Level 1 (Raised Surfaces):** `box-shadow: 2px 2px 6px rgba(163, 177, 198, 0.4), -2px -2px 6px rgba(255, 255, 255, 0.9)`. Used for dashboard cards, table containers, and sidebar.
- **Level 2 (High Focus):** `box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.3), -6px -6px 12px rgba(255, 255, 255, 1)`. Reserved for interactive modals and floating drawers.
- **Inset (Valleys):** `box-shadow: inset 2px 2px 5px rgba(163, 177, 198, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.7)`. This recessed style is used for chart areas, search inputs, and the active/pressed states of navigation items.
- **Depth Contrast:** Instead of alternating row colors, tables use 1px `outline-variant` bottom borders to maintain the "Silk" surface continuity.

## Shapes

The design system employs a **Soft (Level 1)** roundedness profile to project a precise, technical, and industrial personality.

- **Precision Components:** Buttons, input fields, and chips use a 0.25rem (4px) radius to feel sharp and intentional.
- **Structural Containers:** Cards and dashboard modules use 0.5rem (8px) for a modern, structured frame.
- **System Indicators:** Status pills and circular avatar frames use a full 999px radius to distinguish them as floating or semantic elements within the rigid layout.

## Components

### High-Density Data Tables
The centerpiece of the system.
- **Header:** Use `label-caps` in `on-surface-variant`.
- **Rows:** Standard height is 56px, dense is 40px. On hover, the row transitions to `surface-bright` with a 2px `primary-color` vertical accent on the extreme left.
- **Data Cells:** Use `data-md` for all numerical values. Text-based labels use `body-sm`.

### Analytical Charts
- **Line/Bar Styles:** Use `primary-color` for the main data series. Secondary series use `secondary-color` or `tertiary-color`.
- **The "Valley" Container:** Chart backgrounds must use the **Inset** shadow profile, making the data appear recessed into the interface console.
- **Axes & Grids:** Use `outline-variant` for grid lines with 0.5px stroke width.

### Inspection Drawers (Users, Jobs, Companies)
- **Structure:** Level 2 elevation, sliding from the right. 
- **Header:** Contains the entity name in `headline-md` and a "Status Pill."
- **Content:** Grouped into "Technical Specifications" using `label-caps` as section dividers. Quantitative history (e.g., Job Success Rate) should be displayed in a recessed "Valley" metric card.

### Input Fields & Controls
- **Search/Inputs:** Use the **Inset** shadow style. When focused, the inner shadow deepens and the border transitions to `primary-color`.
- **Buttons:**
  - **Primary:** Solid `primary-color` fill.
  - **Secondary:** Level 1 Raised style with `on-surface` text.
  - **Tertiary/Ghost:** Flat with `primary-color` text, no shadow.

### Metric Readouts
- Small dashboard widgets featuring `data-lg` for the primary value and `label-caps` for the title. A 1.5px sparkline in the bottom third indicates the 7-day trend.