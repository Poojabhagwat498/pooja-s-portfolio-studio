<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the portfolio as a single editorial scrolling page with in-page section links, matching the requested reference site while avoiding fabricated credentials or contact details.
- Store portfolio visual tokens and layout rules in `src/styles.css`; generated editorial images live under `src/assets/` for bundled rendering.
- Call requests hand off a prefilled message to WhatsApp rather than implying confirmed availability, because no calendar service is connected.
- Persist theme preference in browser storage and apply it to the root class, because the portfolio does not use accounts.
- Use native smooth anchor scrolling and client-only GSAP ScrollTrigger decoration, because the content must remain accessible and visible before hydration and when motion is reduced.
- Store blog posts in Lovable Cloud with public reads limited to published posts and all writes restricted to Pooja's authenticated email.
- Use the navy/cream token system with layered editorial sections across every portfolio route, so the visual identity stays cohesive in both themes.
- Mount the animated 3D jellyfish once in the root layout and gate it until browser hydration, so it persists across pages without server-rendering WebGL.
- Render only the main jellyfish in its transparent canvas, keeping scene decoration out so it floats directly over page content.
- Send contact submissions through a server function and the linked email provider, so delivery credentials stay off the public page.
- Use one shared case-study gallery on Home and Portfolio, because duplicate Work listings are no longer part of the requested presentation.
- Initialize theme once in the root layout and expose control variants as data attributes, so theme persistence and section-specific button styles remain consistent across navigation.
- Share theme state through a browser event and persistent storage, because the jellyfish and navigation switch must stay synchronized across pages.
- Keep the name flip in a dedicated accessible text component and phone jellyfish positioning tied to its reserved hero slot, because motion must not clip words or block actions.
