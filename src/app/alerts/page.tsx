
"use client";

import { Bell, Calendar, ShieldCheck, Wrench, IndianRupee, History } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { serviceRecords, insurancePolicies, expenses } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AlertsPage() {
    const upcomingServices = serviceRecords
        .filter((s) => s.nextDueDate && !isPast(new Date(s.nextDueDate)))
        .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());
    
    const upcomingRenewals = insurancePolicies
        .filter((p) => !isPast(new Date(p.expiryDate)))
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    const allAlerts = [
        ...upcomingServices.map(s => ({...s, type: 'service' as const})),
        ...upcomingRenewals.map(p => ({...p, type: 'insurance' as const}))
    ].sort((a,b) => {
        const dateA = new Date(a.type === 'service' ? a.nextDueDate! : a.expiryDate);
        const dateB = new Date(b.type === 'service' ? b.nextDueDate! : b.expiryDate);
        return dateA.getTime() - dateB.getTime();
    });

    const recentActivity = [
      ...expenses.map(e => ({ type: 'expense' as const, ...e})),
      ...serviceRecords.map(s => ({ type: 'service' as const, ...s}))
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);


  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Alerts & Activity</h1>
        <p className="text-muted-foreground">
          Stay on top of upcoming events and view your recent activity.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-start">
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
                      const urgency = daysLeft < 7 ? "destructive" : daysLeft < 30 ? "secondary" : "default";

                      return (
                        <li 
                          key={`service-${alert.id}`}
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
                      const urgency = daysLeft < 15 ? "destructive" : daysLeft < 45 ? "secondary" : "default";

                      return (
                          <li 
                            key={`insurance-${alert.id}`}
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

        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><History/> Recent Activity</CardTitle>
                <CardDescription>Your last 5 recorded actions.</CardDescription>
            </CardHeader>
            <CardContent>
                {recentActivity.length > 0 ? (
                  <ul className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <li key={`${activity.type}-${activity.id}`} className="flex items-center gap-4">
                         <div className="bg-muted p-3 rounded-full">
                           {activity.type === 'expense' ? <IndianRupee className="h-5 w-5 text-primary" /> : <Wrench className="h-5 w-5 text-primary" />}
                         </div>
                         <div className="flex-1">
                           <p className="font-semibold">
                            {activity.type === 'expense' ? activity.description : activity.service}
                           </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.vehicleName}
                            </p>
                         </div>
                         <div className="text-right">
                           {activity.type === 'expense' && <p className="font-mono text-foreground font-semibold">₹{activity.amount.toLocaleString('en-IN')}</p>}
                           <p className="text-xs text-muted-foreground">{format(new Date(activity.date), "dd MMM, yyyy")}</p>
                         </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No recent activity.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
