
"use client";

import { useTheme } from "@/context/theme-context";
import { useSettings } from "@/context/settings-context";
import { useData } from "@/context/data-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sun, Moon, Bell, BellOff, Trash2, ListRestart, AlarmClock } from "lucide-react";
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";

export function AppSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, setSetting } = useSettings();
  const { clearAllData } = useData();
  const { toast } = useToast();
  const isDark = theme === 'dark';

  const handleClearData = () => {
    clearAllData();
    toast({
      title: "Data Cleared",
      description: "All application data has been reset.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Appearance</h4>
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

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Preferences</h4>
         <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="sort-order" className="flex items-center gap-2">
              <ListRestart className="h-5 w-5"/>
              Default Sort Order
            </Label>
             <Select
                value={settings.defaultSortOrder}
                onValueChange={(value) => setSetting('defaultSortOrder', value as 'newest' | 'oldest')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
        </div>
      </div>


      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Notifications</h4>
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
         <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="sort-order" className="flex items-center gap-2">
              <AlarmClock className="h-5 w-5"/>
              Reminder Lead Time
            </Label>
             <Select
                value={String(settings.reminderLeadTime)}
                onValueChange={(value) => setSetting('reminderLeadTime', parseInt(value, 10))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
        </div>
         <p className="text-xs text-muted-foreground mt-2 px-1">
            How many days in advance you want to be reminded of upcoming services or insurance renewals.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Data Management</h4>
        <div className="flex items-center space-x-2 rounded-lg border p-3">
          <Trash2 className="h-5 w-5"/>
          <Switch
            id="clear-data-logout"
            checked={settings.clearDataOnLogout}
            onCheckedChange={(checked) => setSetting('clearDataOnLogout', checked)}
          />
          <Label htmlFor="clear-data-logout" className="flex-1 ml-2">
              Clear Session Data on Logout
          </Label>
        </div>
         <p className="text-xs text-muted-foreground mt-2 px-1">
            If enabled, temporary data (like which notification alerts have been shown) will be cleared when you log out.
        </p>
         <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-3">
            <div>
              <Label className="text-destructive">Reset App</Label>
              <p className="text-xs text-destructive/80">Permanently delete all data.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Clear All Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your vehicles, services, expenses, and documents from this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
    </div>
  );
}
