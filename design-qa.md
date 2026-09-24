# LIFE IDEA design QA

- Source visual truth: `reference-ink-motion.png` (860 × 1828 px), the revised selected Ink & Light concept.
- Rendered implementation: `http://127.0.0.1:4173/` with Playwright browser captures under `output/playwright/`.
- Desktop viewport: 1440 × 900 CSS px at 1× screenshot scale. Mobile viewport: 390 × 844 CSS px at 1×.
- States compared: opening hero; childhood at mid-scroll; youth and old age at mid-scroll; final breath at 90% scene progress; company reveal after the death section; mobile hero, childhood, death, and reveal.
- Density normalization: the tall source storyboard remains at 860 × 1828. In the overview, desktop screenshots were scaled from 1440 × 900 to 720 × 450 and placed beside it. Focused hero and reveal crops were normalized to equal widths for visual comparison.

## Evidence

- Full-view comparison: `output/playwright/design-comparison.jpg`. The selected storyboard is on the left; browser-rendered opening, childhood, completed death, and company reveal are on the right.
- Focused comparisons: `output/playwright/focused-hero-comparison.jpg` and `output/playwright/focused-reveal-comparison.jpg`.
- Mobile browser captures: `hero-final-mobile.png`, `child-final-mobile.png`, `ending-final-mobile.png`, and `reveal-top-mobile.png` in `output/playwright/`.
- Browser console: zero errors after the favicon and asset paths were corrected.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: editorial serif hierarchy, small uppercase labels, and readable body copy follow the reference. The responsive implementation uses larger chapter text because each storyboard row becomes a full-screen scroll scene.
- Spacing and layout: desktop scenes preserve a left-text/right-character composition, wide negative space, and a distinct final company area. Mobile sections stack without horizontal overflow; measured document width was 375 px within a 390 px viewport.
- Colors and visual tokens: warm ivory, charcoal, and muted gold are consistent. Generated character art has somewhat fuller warm shading than the sketchier mockup; this is a P3 style difference.
- Image quality and asset fidelity: generated character sheets, landscapes, gold path, breath wisp, and memorial still life replace all visible custom art. Served WebP illustrations total approximately 2.62 MB; PNG originals are kept in `source-assets/`.
- Copy and content: the business name and offer appear only after the death section. Contact details are placeholders, and the form explicitly says it does not send messages.
- Interaction: browser checks showed childhood progress and pose returning to their earlier values on reverse scroll; youth, adult, and old-age sheets change poses; the final breath changes from breathing to stillness. The demo form validates fields and reports that the message was not sent. Reduced-motion emulation disabled transforms and running echoes while keeping the final text visible.

## Comparison history

1. Initial mobile hero art overlapped supporting text. The illustration was resized and moved down; the small mobile scroll hint was hidden. Post-fix evidence: `hero-final-mobile.png`.
2. Initial character scenes were visually sparse beside the source. Generated ink panoramas and a gold path were added behind the figures. Post-fix evidence: `hero-final-desktop.png`, `child-final-desktop.png`, and `youth-final-desktop.png`.
3. Later life stages initially used single translated figures. Three-pose sheets were added for youth, adulthood, and old age. Post-fix evidence: `youth-sprite-desktop.png`, `old-sprite-desktop.png`, and the scroll-state browser inspection.

## Build checks

- `npm run build`: passed.
- `npm run test:sites`: 4 passed, 0 failed.
- Browser images: none broken.
- No deployment or contact backend was added.



## September 2026 motion refinement

- Feedback history: the first scroll version moved too quickly; fading whole sprite frames hid leg movement; a time-based loop kept running while idle; a capped visual-progress version lagged behind fast scrolling. The current version responds only to scroll input and keeps character position aligned with the scene.
- Current browser evidence: `output/playwright/runner-pose-board.png` shows four poses during real 80 px wheel inputs spaced 280 ms apart; `output/playwright/short-mobile-fixed.png` shows the compact phone layout at 375 × 237 CSS px.
- Fast scroll check: a 600 px mouse-wheel input advanced one leg pose and moved the runner from -3.74vw to 3.54vw; reversing restored the prior pose and position. Five rapid 60 px wheel inputs produced one leg-pose advance; a further 10 px input after the pause did not catch up any queued poses. Pose changes are limited to once every 240 ms. No runner CSS animation runs between scroll events.
- Short-window layout: the character fits in the 375 × 237 viewport, and copy no longer overlaps the illustration. Mobile overflow remained false.
- Reduced-motion behavior: holds the first pose with no vertical lift. The ending and reveal behavior are unchanged.
- Final checks after the correction: production build passed; Sites tests passed 4/4; Playwright reported zero console errors.

final result: passed
