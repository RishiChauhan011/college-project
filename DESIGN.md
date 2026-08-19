---
name: Topographic Intelligence
colors:
  surface: '#eef2f6'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464554'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
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
  tertiary: '#712ae2'
  on-tertiary: '#ffffff'
  tertiary-container: '#8a4cfc'
  on-tertiary-container: '#fffbff'
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
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  success: '#10b981'
  warning: '#f59e0b'
  danger: '#ef4444'
  waypoint: '#6366f1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
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
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1280px
---

## Brand & Style

The design system is engineered for a professional AI Career Intelligence platform, moving beyond standard neomorphism into a "Topographic Navigation" aesthetic. The brand personality is authoritative yet visionary, positioning career paths not as static resumes but as dynamic landscapes to be navigated.

The visual style blends **Soft UI** with **Precision Engineering**. It utilizes subtle elevation profiles, contour lines, and waypoint markers to signify progress and depth. Unlike traditional neomorphism which can feel "squishy," this system is refined with sharper data visualization and crisp typography to maintain a high-density, professional utility. It evokes a sense of clarity, strategic foresight, and technical sophistication.

## Colors

The palette is rooted in a professional "Slate" foundation. The background surface (`#eef2f6`) acts as the base terrain. Depth is created not through heavy color shifts, but through precise shadow manipulation.

- **Primary Indigo (#6366f1):** Used for waypoints, active career paths, and primary actions.
- **Deep Slate (#1e293b):** Reserved for high-contrast typography and navigational headers to ensure grounding and authority.
- **Functional Accents:** Vibrant status colors are used sparingly for career health indicators and skill gap alerts.
- **Topographic Lines:** Very low-contrast strokes (`rgba(30, 41, 59, 0.05)`) may be used to represent "contour lines" in the background of large containers.

## Typography

Typography follows a strict hierarchy to manage high-density career data.
- **Headlines:** Use **Plus Jakarta Sans** for a modern, approachable, yet professional tone. Large headings should use tighter letter spacing to feel more cohesive.
- **Body:** **Inter** provides maximum legibility for long-form career descriptions and role requirements.
- **Data & Metrics:** **JetBrains Mono** is utilized for all technical data, salary figures, and percentage match scores, emphasizing the "intelligence" and "AI" aspect of the platform.

## Layout & Spacing

The layout uses a **Fluid Grid** system based on a 4px baseline shift. 
- **Desktop:** 12-column grid with 24px gutters. Content is housed in "Elevation-Chart Containers" that stretch to fill the grid.
- **Mobile:** Single column with 16px margins. Complex data tables should reflow into "Raised Card" stacks.
- **Spacing Rhythm:** Use 16px (4 units) for internal element padding and 32px (8 units) for section vertical spacing to maintain a clean, airy "topographic" feel.

## Elevation & Depth

This system uses "Subtle Elevation Profiles" to indicate hierarchy. 
- **Level 0 (Base):** The `#eef2f6` background surface.
- **Level 1 (Raised):** Used for main cards and skill chips. `box-shadow: 4px 4px 10px rgba(163, 177, 198, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.8)`.
- **Level 2 (Active/Pressed):** Used for active waypoints and input fields. `box-shadow: inset 2px 2px 5px rgba(163, 177, 198, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.7)`.
- **Contour Lines:** Use thin 1px strokes in a darker neutral tone to connect waypoints in a career path, simulating a map's elevation lines.

## Shapes

The design system employs a **Rounded** shape language to reinforce the soft-touch neomorphic feel. 
- **Standard Elements:** 0.5rem (8px) for buttons and small containers.
- **Large Containers:** 1rem (16px) for main dashboard cards.
- **Waypoints:** Perfectly circular (pill-shaped) to represent nodes on a graph or map.

## Components

### Skill Chips
Raised neomorphic surface with **JetBrains Mono** text. On hover, the chip transitions to an inset shadow to feel "pressed" or "selected."

### Career-Path Waypoints
Circular nodes with a primary indigo fill. Connected by a 2px "Contour Line" stroke. Active waypoints feature a soft outer glow (drop shadow with primary color tint at 20% opacity).

### Elevation-Chart Containers
Large card surfaces containing data visualizations. The background of the chart itself uses an inset shadow to appear as a "valley" or "basin" within the raised card profile.

### Data-Dense Tables
Tables should avoid heavy borders. Use alternating "Raised" and "Flat" rows for legibility. Headers use **Deep Slate** text in **JetBrains Mono** for a technical, organized appearance.

### Inputs & Search
Always use the "Inset" (sunken) style. The text should feel like it is being typed into the surface of the interface. Use a primary color 2px border only on focus state.