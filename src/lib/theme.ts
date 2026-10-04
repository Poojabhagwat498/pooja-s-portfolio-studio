export const THEME_KEY = "pb-color-theme";
export const THEME_EVENT = "pb-theme-change";

export function setTheme(dark: boolean, origin?: { x: number; y: number }) {
  const apply = () => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: dark }));
  };

  if (!origin || !document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }

  const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
  const transition = document.startViewTransition(apply);
  void transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
      { duration: 650, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" },
    );
  }).catch(() => { /* the theme has already changed */ });
}