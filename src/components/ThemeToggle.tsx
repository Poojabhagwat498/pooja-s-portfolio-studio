import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setTheme, THEME_EVENT, THEME_KEY } from "@/lib/theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    const shouldUseDark = saved === "dark" || (saved === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
    const update = (event: Event) => setDark((event as CustomEvent<boolean>).detail);
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    setTheme(next);
  }

  return (
    <Button type="button" variant="ghost" size="icon" className="theme-toggle text-foreground hover:bg-muted hover:text-foreground" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}>
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}