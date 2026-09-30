# Warm experimental portfolio redesign

## Changes
- Replace the full color system with the supplied cream, amber, brown, and near-black palette across light and dark themes.
- Rebuild the home hero as an immersive layered composition using Pooja’s name, developer role, original system artwork, project counters, and clear project/résumé actions.
- Restructure About, Experience, Projects, Skills, Achievements, Blog, and Contact into alternating editorial bands with asymmetric grids and overlapping rounded transitions.
- Restyle the Portfolio, Blog, sign-in, and writing pages so the whole site feels cohesive.
- Retain all existing verified content, links, résumé download, portrait, theme switch, case-study tools, blog access, and WhatsApp booking flow.
- Refine the existing GSAP motion for layered hero entry, heading reveals, counters, card depth, and section transitions while preserving reduced-motion accessibility.

## Verification
- Check desktop and phone layouts for overflow, overlap, readable contrast, and usable navigation.
- Confirm the original hero-system artwork, portfolio cards, theme switch, résumé, blog, and booking controls remain visible and functional.
- Confirm motion degrades cleanly for reduced-motion visitors and the preview builds without errors.

## Technical details
- Keep all visual tokens and structural styling centralized in the shared stylesheet.
- Reuse the existing client-only GSAP layer and semantic UI controls; no backend or content model changes.
