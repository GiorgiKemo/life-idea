# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## LIFE IDEA visual direction

- The chosen visual reference is `reference-ink-motion.png`: warm ivory, charcoal ink illustration, restrained muted gold, editorial serif typography, generous whitespace.
- This is one scroll-driven story. Every chapter needs visible character motion tied to scrolling; the child runs across childhood as the visitor scrolls.
- The same male character ages from the opening family scene through youth, adulthood, old age, and a peaceful on-screen death.
- The funeral business stays hidden until after the death chapter. The final reveal shows `EXAMPLE COMPANY NAME`, coffins and memorial accessories, placeholder contact details, and a clearly labeled demo form that does not send messages.
- Motion correction (September 2026): the running boy changes leg poses only on scroll input, at most once every 240 ms during a quick burst. Large wheel jumps may advance one pose, then hold at rest; reverse input reverses the pose. Keep horizontal travel restrained and directly tied to the scene scroll position so the child cannot lag out of the sticky scene. For short phone windows (700 px wide or less and 500 px tall or less), reduce the runner and copy layout to keep both on screen.
