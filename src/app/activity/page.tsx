
"use client";

import React, { useMemo } from "react";
import { Wrench, IndianRupee, History } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppContext } from "@/context/app-provider";
import { useSettings } from "@/context/settings-context";

function ActivityPageComponent() {
  const { expenses, serviceRecords } = useAppContext();
  const { settings } = useSettings();

  const allActivity = useMemo(() => {
    return [
      ...expenses.map(e => ({ type: 'expense' as const, ...e})),
      ...serviceRecords.map(s => ({ type: 'service' as const, ...s}))
    ]
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return settings.defaultSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [expenses, serviceRecords, settings.defaultSortOrder]);

  return (
    <div className="p-4 md:p-8 animate-fade-in">
        <div className="mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1">Full Activity Log</h1>
            <p className="text-muted-foreground">
            A complete history of all your expenses and services.
            </p>
        </div>
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><History/> Activity History</CardTitle>
                <CardDescription>All your recorded actions sorted by {settings.defaultSortOrder === 'newest' ? 'most recent' : 'oldest'}.</CardDescription>
            </CardHeader>
            <CardContent>
                {allActivity.length > 0 ? (
                  <ul className="space-y-4">
                    {allActivity.map((activity, index) => (
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
                  <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-2">
                    <History className="h-10 w-10 text-muted-foreground/50"/>
                    <p className="font-medium">No activity recorded yet.</p>
                    <p className="text-sm">Your vehicle services and expenses will appear here.</p>
                  </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

const ActivityPage = React.memo(ActivityPageComponent);
export default ActivityPage;
