# Awair Cloud: Design System Documentation

## 1. Overview & Creative North Star
**The Creative North Star: "The Observational Monolith"**

This design system moves beyond the utility of a standard dashboard to create an "Observational Monolith." It treats indoor air data not as static numbers, but as a living, breathing digital atmosphere. We achieve a high-end editorial feel by rejecting traditional "boxed" layouts in favor of **Intentional Asymmetry** and **Tonal Depth**. 

The system utilizes high-contrast typography scales and overlapping surface layers to create a sense of precision and professional authority. By embracing "breathing room" (generous white space) and avoiding rigid grid lines, the UI feels expansive and contemporary—less like a spreadsheet and more like a premium instrumentation panel.

---

### 2. Colors & Surface Architecture
The color palette is rooted in a deep charcoal foundation, using vibrant but sophisticated accents to categorize air quality.

#### The "No-Line" Rule
To maintain a premium aesthetic, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through background color shifts or tonal transitions. Use `surface-container-low` (#1A1C20) sitting on a `surface` (#111317) background to create a clean, modern edge without visual noise.

#### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to create "nested" depth:
*   **Background / Surface:** `#111317` (The base layer).
*   **Surface Container Low:** `#1A1C20` (Secondary sections/sidebars).
*   **Surface Container:** `#1E2024` (Standard cards/widgets).
*   **Surface Container High:** `#282A2E` (Active states or elevated elements).

#### The "Glass & Gradient" Rule
Use Glassmorphism for floating overlays (e.g., Modals, Tooltips). Use `surface-variant` (#333539) at 60% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** For primary CTAs or critical metrics, use a subtle linear gradient from `primary` (#4EDE03) to `primary-container` (#10B981) to provide "soul" and depth.

---

### 3. Typography: The Editorial Voice
We use **Inter** exclusively. The power of this system lies in the dramatic scale difference between data visualization and supporting metadata.

| Token | Size | Usage |
| :--- | :--- | :--- |
| **Display-LG** | 3.5rem | Hero metrics (e.g., Air Quality Index number). |
| **Headline-MD** | 1.75rem | Section headers for sensor groups. |
| **Title-SM** | 1.0rem | Card titles; bolded for clear categorization. |
| **Body-MD** | 0.875rem | Primary reading text; high-legibility. |
| **Label-SM** | 0.6875rem | All-caps metadata; used for timestamps/units. |

**Editorial Note:** Always pair a `Display-LG` metric with a `Label-SM` unit descriptor to create a sophisticated, high-contrast visual anchor.

---

### 4. Elevation & Depth
Depth is conveyed through **Tonal Layering** rather than drop shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card (#0C0E12) onto a `surface-container-low` section (#1A1C20) to create a "sunken" effect for data logs, or vice-versa for a "lifted" effect.
*   **Ambient Shadows:** For floating elements, use a 32px blur with 6% opacity using a tint of `on-surface` (#E2E2E8). Never use pure black for shadows.
*   **The Ghost Border:** If a boundary is required for accessibility, use the `outline-variant` (#3C4A42) at 20% opacity. This creates a "suggestion" of a border that feels integrated into the dark theme.

---

### 5. Components

#### Cards & Data Modules
*   **Constraint:** Forbid divider lines. Use `Spacing-6` (2rem) or background shifts to separate content.
*   **Style:** `1.5rem` (xl) rounded corners. Use `surface-container` as the base.

#### Primary Action Buttons
*   **Style:** `1.5rem` (full) rounded corners. 
*   **Color:** Gradient from `primary` (#4EDE03) to `primary-container` (#10B981).
*   **Padding:** `1.4rem` horizontal, `0.7rem` vertical.

#### Status Chips (The Metric Indicators)
*   **Good:** `on-primary-container` text on `primary` background.
*   **Warning:** `on-secondary-container` text on `secondary` background (#FFB95F).
*   **Critical:** `on-tertiary-container` text on `tertiary` background (#FFB2B7).
*   **Shape:** Pill-shaped (`full` roundedness) with `Label-MD` typography.

#### Input Fields
*   **Style:** `surface-container-lowest` background with a `1px` ghost border (20% `outline-variant`).
*   **Active State:** Transition the ghost border to 100% `primary` opacity.

#### Awair score gauge (custom component)
*   A semi-circular progress arc using `surface-variant` for the track and a `primary` to `primary-fixed` gradient for the value. Use `Display-MD` for the center value.

---

### 6. Do’s and Don’ts

#### Do
*   **Do** use asymmetrical layouts. A large metric on the left balanced by smaller metadata on the right creates a premium, "dashboard-as-art" feel.
*   **Do** use the `1.5rem` (xl) corner radius for all primary containers to maintain the "soft minimalist" look.
*   **Do** leverage `surface-bright` (#37393E) for hover states on dark cards to create an immediate sense of tactile response.

#### Don’t
*   **Don’t** use pure black (#000000) or pure white (#FFFFFF). Stick to the defined tonal tokens to preserve the "Midnight Charcoal" atmosphere.
*   **Don’t** use standard 1px dividers. If you feel the need for a line, increase the spacing instead.
*   **Don’t** crowd the interface. If a screen feels busy, increase the spacing to `Spacing-10` (3.5rem) between major modules.