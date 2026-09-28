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
