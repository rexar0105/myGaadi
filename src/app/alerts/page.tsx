
"use client";

import { useEffect, useMemo } from "react";
import { Bell, ShieldCheck, Wrench } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/context/settings-context";
import { useAppContext } from "@/context/app-provider";

export default function AlertsPage() {
    const { toast } = useToast();
    const { settings } = useSettings();
    const { serviceRecords, insurancePolicies } = useAppContext();

    const allAlerts = useMemo(() => {
        const upcomingServices = serviceRecords
            .filter((s) => s.nextDueDate && !isPast(new Date(s.nextDueDate)))
            .map(s => ({...s, type: 'service' as const, id: `service-${s.id}`}));
        
        const upcomingRenewals = insurancePolicies
            .filter((p) => !isPast(new Date(p.expiryDate)))
            .map(p => ({...p, type: 'insurance' as const, id: `insurance-${p.id}`}));

        return [
            ...upcomingServices,
            ...upcomingRenewals
        ].sort((a,b) => {
            const dateA = new Date(a.type === 'service' ? a.nextDueDate! : a.expiryDate);
            const dateB = new Date(b.type === 'service' ? b.nextDueDate! : b.expiryDate);
            return dateA.getTime() - dateB.getTime();
        });
    }, [serviceRecords, insurancePolicies]);


    useEffect(() => {
      if (!settings.notificationsEnabled) return;

      const notifiedAlertsKey = 'myGaadiNotifiedAlerts';
      let notifiedAlerts: string[] = [];
      try {
        notifiedAlerts = JSON.parse(sessionStorage.getItem(notifiedAlertsKey) || '[]');
      } catch (e) {
        console.error("Failed to parse notified alerts from session storage", e);
        notifiedAlerts = [];
      }
      
      const newNotifications: string[] = [];

      allAlerts.forEach(alert => {
        if (notifiedAlerts.includes(alert.id)) return;

        let isUrgent = false;
        let title = '';
        let description = '';
        const { reminderLeadTime } = settings;

        if (alert.type === 'service') {
          const daysLeft = differenceInDays(new Date(alert.nextDueDate!), new Date());
          if (daysLeft >= 0 && daysLeft <= reminderLeadTime) {
            isUrgent = true;
            title = `Service Due Soon: ${alert.vehicleName}`;
            description = `${alert.service} is due in ${daysLeft} days.`;
          }
        } else { // Insurance
          const daysLeft = differenceInDays(new Date(alert.expiryDate), new Date());
           if (daysLeft >= 0 && daysLeft <= reminderLeadTime) {
            isUrgent = true;
            title = `Insurance Expiring: ${alert.vehicleName}`;
            description = `Policy from ${alert.provider} expires in ${daysLeft} days.`;
           }
        }

        if (isUrgent) {
          toast({
            title: title,
            description: description,
            variant: "destructive",
          });
          newNotifications.push(alert.id);
        }
      });

      if (newNotifications.length > 0) {
        sessionStorage.setItem(notifiedAlertsKey, JSON.stringify([...notifiedAlerts, ...newNotifications]));
      }
    }, [toast, settings.notificationsEnabled, allAlerts, settings.reminderLeadTime]);


  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1">Alerts & Reminders</h1>
        <p className="text-muted-foreground">
          Stay on top of upcoming service due dates and insurance renewals.
        </p>
      </div>
      <Card className="animate-fade-in-up">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-xl">
                <Bell className="text-primary"/> Upcoming Events
            </CardTitle>
            <CardDescription>
                All upcoming service due dates and insurance renewals.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {allAlerts.length > 0 ? (
                <ul className="space-y-6">
                {allAlerts.map((alert, index) => {
                  if (alert.type === 'service') {
                    const dueDate = new Date(alert.nextDueDate!);
                    const daysLeft = differenceInDays(dueDate, new Date());
                    const urgency = daysLeft < settings.reminderLeadTime/2 ? "destructive" : daysLeft < settings.reminderLeadTime ? "secondary" : "default";

                    return (
                      <li 
                        key={alert.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-muted p-3 rounded-full">
                            <Wrench className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{alert.service}</p>
                            <p className="text-sm text-muted-foreground">{alert.vehicleName}</p>
                            <p className="text-xs text-muted-foreground/80 mt-1">
                              Due on: {format(dueDate, "dd MMM, yyyy")}
                            </p>
                          </div>
                        </div>
                        <Badge variant={urgency === 'default' ? 'outline' : urgency} className="self-start sm:self-center">
                          {daysLeft <= 0 ? "Due Today" : `${daysLeft} days left`}
                        </Badge>
                      </li>
                    );
                  } else { // Insurance
                    const expiryDate = new Date(alert.expiryDate);
                    const daysLeft = differenceInDays(expiryDate, new Date());
                    const urgency = daysLeft < settings.reminderLeadTime/2 ? "destructive" : daysLeft < settings.reminderLeadTime ? "secondary" : "default";

                    return (
                        <li 
                          key={alert.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-muted p-3 rounded-full">
                              <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">Insurance Renewal</p>
                              <p className="text-sm text-muted-foreground">{alert.vehicleName} ({alert.provider})</p>
                              <p className="text-xs text-muted-foreground/80 mt-1">
                                Expires on: {format(expiryDate, "dd MMM, yyyy")}
                              </p>
                            </div>
                          </div>
                          <Badge variant={urgency === 'default' ? 'outline' : urgency} className="self-start sm:self-center">
                            {daysLeft <= 0 ? "Expires Today" : `${daysLeft} days left`}
                          </Badge>
                        </li>
                    )
                  }
                })}
              </ul>
            ) : (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-2">
                    <Bell className="h-10 w-10 text-muted-foreground/50"/>
                    <p className="font-medium">No upcoming alerts.</p>
                    <p className="text-sm">You're all caught up!</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
