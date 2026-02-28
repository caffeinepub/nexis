import { cn } from "@/lib/utils";
import { Moon, Sparkles, Sun } from "lucide-react";
import { type Theme, useTheme } from "../context/ThemeContext";

const themes: {
  id: Theme;
  label: string;
  icon: React.ReactNode;
  gradient: string;
}[] = [
  {
    id: "dark",
    label: "Dark",
    icon: <Moon size={14} />,
    gradient: "from-indigo-900 to-slate-950",
  },
  {
    id: "light",
    label: "Light",
    icon: <Sun size={14} />,
    gradient: "from-slate-100 to-white",
  },
  {
    id: "pastel",
    label: "Pastel",
    icon: <Sparkles size={14} />,
    gradient: "from-pink-200 to-purple-200",
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
      {themes.map((t) => (
        <button
          type="button"
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            theme === t.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
