# Restore the home hero and premium motion

## Changes
- Restore the original `hero-system.jpg` artwork in the home-page hero without changing Pooja’s portrait in the About section.
- Extend the existing motion layer to animate the home hero title, role, tags, artwork, statement, and calls to action on entry.
- Keep scroll-triggered heading reveals, project-card scaling, and project counters active on the home page as well as `/portfolio`.
- Refine the dark-to-light section transitions with restrained overlap and rounded boundaries while keeping content readable before animation.
- Preserve native smooth scrolling and disable decorative motion for visitors who prefer reduced motion.

## Verification
- Check desktop and phone layouts for overflow, overlapping text, and correct hero artwork.
- Verify heading reveals, counters, section transitions, and reduced-motion behavior on the home page.
- Confirm the preview builds without errors.

## Technical details
- Continue using the existing client-only GSAP + ScrollTrigger module and semantic styles in the shared stylesheet.
- Do not add persistence, backend work, or alter portfolio content.
