import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage unavailable (private mode etc.) — the in-page toggle still works
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={toggle}
      aria-label="ライト / ダークテーマを切り替え"
      className={className}
    >
      {/* icon choice is driven by the .dark class so SSR never mismatches */}
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
