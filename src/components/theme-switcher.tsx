
"use client";

import { useTheme } from "@/context/theme-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-foreground mb-2">Appearance</h4>
      <div className="flex items-center space-x-2 rounded-lg border p-3">
         <Sun className="h-5 w-5"/>
        <Switch
          id="dark-mode"
          checked={isDark}
          onCheckedChange={handleThemeChange}
        />
        <Moon className="h-5 w-5"/>
        <Label htmlFor="dark-mode" className="flex-1 ml-2">
            {isDark ? 'Dark Mode' : 'Light Mode'}
        </Label>
      </div>
    </div>
  );
}
