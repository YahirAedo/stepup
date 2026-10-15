---
name: Serene Focus
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#414943'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#717972'
  outline-variant: '#c0c9c1'
  surface-tint: '#36684e'
  primary: '#003a24'
  on-primary: '#ffffff'
  primary-container: '#1e5139'
  on-primary-container: '#8ec2a4'
  inverse-primary: '#9dd2b3'
  secondary: '#4f6358'
  on-secondary: '#ffffff'
  secondary-container: '#d2e8da'
  on-secondary-container: '#55695e'
  tertiary: '#482b0f'
  on-tertiary: '#ffffff'
  tertiary-container: '#624123'
  on-tertiary-container: '#dcae88'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b8efce'
  primary-fixed-dim: '#9dd2b3'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#1d5038'
  secondary-fixed: '#d2e8da'
  secondary-fixed-dim: '#b6ccbe'
  on-secondary-fixed: '#0c1f17'
  on-secondary-fixed-variant: '#384b41'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#edbd96'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#604022'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
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
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1.25rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is tailored for an intentional anti-procrastination environment where sensory overload and decision fatigue are actively diminished. The design language fuses warm editorial minimalism with precise, utilitarian tools. The product addresses individuals feeling overwhelmed by high-friction task managers by substituting artificial urgency with calm clarity, deliberate cadence, and natural visual rest.

The emotional signature is grounded, reassuring, and mentally quiet. Interactions must feel tangible and quiet—reminiscent of architectural notebooks, premium stationery, and daylight-filled focus spaces. Visual distractions are removed in favor of structural clarity, low-chroma warmth, disciplined typographic rhythm, and clear priority indicators.

## Colors

The palette establishes an unhurried, low-contrast atmosphere that eliminates eye strain during deep focus sessions. The color hierarchy relies on tonal papers and deep charcoal ink rather than synthetic grays.

### Surface Tones
- **Base Canvas (`#F9F8F6`):** Warm unbleached paper foundation. Used for global application backdrops and distraction-free read views.
- **Surface Layer (`#F2EFE9`):** Recessed container surface for secondary panels, toolbars, and inactive task groupings.
- **Raised Card Layer (`#FFFFFF`):** High-clarity foreground surface dedicated to active task cards, focus sheets, and popovers.

### Ink & Structural Contrast
- **Deep Ink Neutral (`#1A1C1E`):** Primary text and definitive icons. Provides high legibility without the harshness of pure black.
- **Muted Charcoal (`#43474E`):** Secondary instructional copy, task metadata, and elapsed timers.
- **Subtle Outline (`#E2DED6`):** Hairline boundary token used to frame elements cleanly without heavy visual weight.

### Accents & State
- **Deep Sage Primary (`#1E5139`):** Grounded evergreen representing progress, active session states, and committed actions.
- **Muted Sage Secondary (`#5A6E63`):** Neutralized botanical tone for progress trackers, completed state stamps, and passive indicators.
- **Warm Cedar Tertiary (`#8B6544`):** Earthy accent reserved for priority tags, streaks, and gentle nudge banners.
- **Muted Earth Surface (`#E8EFEA`):** Low-contrast tinted wash for active task states and focus timer highlights.

## Typography

The pairing combines the mechanical precision of **Space Grotesk** with the balanced readability of **Inter**. Space Grotesk governs titles, statistical timers, step numbering, and functional labels—conveying order and structured focus. Inter provides friction-free readability for reflective notes, task descriptions, and breakdown steps.

- **Numerals & Metrics:** Large numerical readouts (such as countdowns and completion totals) use `Space Grotesk` with tabular figures enabled (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during active sessions.
- **Editorial Micro-Copy:** Use `label-sm` with upper-case styling and positive letter-spacing (`0.04em`) exclusively for status tags, keyboard shortcuts, and state indicators.

## Layout & Spacing

The layout model emphasizes breathing room and vertical rhythm, deterring dense dashboard patterns that trigger procrastination anxiety.

- **Grid Systems:**
  - **Mobile (< 640px):** Single-column stack with `margin: 1.25rem` and fluid full-width modules.
  - **Tablet (640px - 1024px):** 6-column fluid grid, `gutter: 1.25rem`, constrained to `720px` max reading container.
  - **Desktop (> 1024px):** 12-column layout with a focused content column capped at `840px` for main task flows and `360px` for auxiliary planning docks.
- **Spatial Disciplines:**
  - Form controls and task items standardize on `space-md` (`1rem`) internal padding.
  - Generous section boundaries (`space-xl` / `2.5rem`) separate active focus blocks from upcoming task backlogs.

## Elevation & Depth

This system avoids dark, synthetic drop shadows. Instead, structural hierarchy is created using tonal layering combined with crisp structural borders (`#E2DED6`).

- **Base Layer (Flat):** Inactive workspaces, structural backgrounds, and list wrappers sit flat on `#F9F8F6` with an optional `#E2DED6` 1px border.
- **Active Card Tier:** Promoted task cards and active timer views use `#FFFFFF` surfaces with a 1px solid `#E2DED6` boundary and an ultra-diffused, ambient warm shadow:
  `box-shadow: 0px 4px 20px -2px rgba(26, 28, 30, 0.04), 0px 1px 2px rgba(26, 28, 30, 0.02)`.
- **Focused Modal / Sheet Tier:** Focus-mode modals and break drawers elevate with an expanded soft ambient diffusion:
  `box-shadow: 0px 12px 36px -4px rgba(26, 28, 30, 0.06), 0px 4px 12px rgba(26, 28, 30, 0.03)`.
- **Backdrop Dimming:** Modals and focus-dimmers use an organic veil: `rgba(242, 239, 233, 0.85)` with a subtle backdrop filter (`backdrop-filter: blur(4px)`), preserving warm daylight tones without harsh black screen covers.

## Shapes

The design uses balanced, modern rounded geometry that balances architectural structure with approachable softness. 

- **Primary Interactive Elements:** Buttons, inputs, and operational chips maintain an `8px` (`0.5rem`) corner radius.
- **Cards & Module Containers:** Primary task blocks and session summaries adopt `16px` (`1rem` / `rounded-lg`) to signal containment and stability.
- **Sheets & Dialogs:** Overlay panels, task-breakdown drawers, and focus sessions use `24px` (`1.5rem` / `rounded-xl`).
- **Pills:** Status badges and completion indicators use fully rounded caps (`9999px`).

## Components

### Buttons
- **Primary Action (Commit / Start):** Background `#1E5139`, foreground `#FFFFFF`, height 44px, padding `0 1.25rem`, border-radius 8px. Hover shifts to `#163D2B`. Pressed shifts to `#112F21`. Zero drop shadow.
- **Secondary (Step / Pause):** Background `#F2EFE9`, border 1px solid `#E2DED6`, foreground `#1A1C1E`. Hover background `#EAE5DD`.
- **Ghost (Skip / Postpone):** Transparent background, foreground `#43474E`. Hover color `#1A1C1E` on `#F2EFE9`.

### Chips & Intent Tags
- **Friction Reduction Tags:** Height 28px, border-radius 9999px. Padding `0 0.75rem`.
- **Active / Sage:** Background `#E8EFEA`, text `#1E5139`, border 1px solid rgba(30, 81, 57, 0.15).
- **Idle / Neutral:** Background `#F2EFE9`, text `#43474E`, border 1px solid `#E2DED6`.

### Task Checkboxes & Radio Selection
- **Checkbox:** 20px × 20px, 4px border-radius. Resting state: border 1.5px solid `#E2DED6`, background `#FFFFFF`.
- **Checked (Resolution):** Background `#1E5139`, border-color `#1E5139`. Icon is a sharp crisp checkmark rendered in `#FFFFFF`.
- **Motion:** Micro-transition of 120ms ease-out on check state, avoiding hyperactive celebratory confetti to preserve tranquil focus.

### Input Fields (Micro-Tasks & Notes)
- **Base Input:** 44px height, background `#FFFFFF`, border 1px solid `#E2DED6`, text `#1A1C1E`, placeholder `#43474E` at 60% opacity.
- **Focus State:** Border 1px solid `#1E5139` with an outward ring of `0 0 0 3px rgba(30, 81, 57, 0.12)`. No harsh browser defaults.

### Cards & Focus Containers
- **Resting Task Row:** `#FFFFFF` background, 1px solid `#E2DED6`, 12px internal padding. Left border remains neutral until targeted.
- **Current Single-Task (Active):** `#FFFFFF` background, 1px solid `#E2DED6` with an accent anchor of 3px solid `#1E5139` along the left rim.
- **Breakdown Drawer:** `#F2EFE9` background container with individual sub-steps presented on clean `#FFFFFF` tiles.

### Dedicated Productivity Component: The "Next Step" Crucible
- A focused element displaying solely one atomic actionable step at a time. It uses a `#FFFFFF` canvas, `1.5rem` internal padding, a prominent timer set in `Space Grotesk`, and a single `#1E5139` button to confirm completion, keeping all ambient backlog tasks tucked away out of sight.