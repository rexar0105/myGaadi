
"use client";

import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const themes = [
  { name: "default", color: "hsl(217 91% 60%)" },
  { name: "forest", color: "hsl(158 41% 30%)" },
  { name: "sunset", color: "hsl(15 82% 55%)" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h4 className="text-sm font-medium text-foreground mb-2">Theme</h4>
      <div className="flex items-center gap-2">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={cn(
              "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
              theme === t.name ? "border-primary" : "border-transparent"
            )}
            style={{ backgroundColor: t.color }}
            aria-label={`Switch to ${t.name} theme`}
          >
            {theme === t.name && <Check className="h-5 w-5 text-primary-foreground" />}
          </button>
        ))}
      </div>
    </div>
  );
}
