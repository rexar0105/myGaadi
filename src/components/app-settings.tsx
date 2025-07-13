
"use client";

import { useTheme } from "@/context/theme-context";
import { useSettings } from "@/context/settings-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Bell, BellOff, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";

export function AppSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, setSetting } = useSettings();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Appearance</h4>
        <div className="flex items-center space-x-2 rounded-lg border p-3">
           <Sun className="h-5 w-5"/>
          <Switch
            id="dark-mode"
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
          <Moon className="h-5 w-5"/>
          <Label htmlFor="dark-mode" className="flex-1 ml-2">
              {isDark ? 'Dark Mode' : 'Light Mode'}
          </Label>
        </div>
      </div>

      <Separator/>

      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Notifications</h4>
        <div className="flex items-center space-x-2 rounded-lg border p-3">
          {settings.notificationsEnabled ? <Bell className="h-5 w-5"/> : <BellOff className="h-5 w-5" />}
          <Switch
            id="notifications"
            checked={settings.notificationsEnabled}
            onCheckedChange={(checked) => setSetting('notificationsEnabled', checked)}
          />
          <Label htmlFor="notifications" className="flex-1 ml-2">
            {settings.notificationsEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
          </Label>
        </div>
      </div>

       <Separator/>

      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Data Management</h4>
        <div className="flex items-center space-x-2 rounded-lg border p-3">
          <Trash2 className="h-5 w-5"/>
          <Switch
            id="clear-data"
            checked={settings.clearDataOnLogout}
            onCheckedChange={(checked) => setSetting('clearDataOnLogout', checked)}
          />
          <Label htmlFor="clear-data" className="flex-1 ml-2">
              Clear Data on Logout
          </Label>
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1">
            If enabled, all session data (like shown notification alerts) will be cleared when you log out.
        </p>
      </div>

    </div>
  );
}
