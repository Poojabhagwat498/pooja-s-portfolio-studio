import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setTheme, THEME_EVENT } from "@/lib/theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
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