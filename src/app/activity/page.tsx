
"use client";

import { Wrench, IndianRupee, History } from "lucide-react";
import { format } from "date-fns";
import { serviceRecords, expenses } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ActivityPage() {

  const recentActivity = [
    ...expenses.map(e => ({ type: 'expense' as const, ...e})),
    ...serviceRecords.map(s => ({ type: 'service' as const, ...s}))
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 10);

  return (
    <div className="p-4 md:p-8 animate-fade-in">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1">Recent Activity</h1>
            <p className="text-muted-foreground">
            A log of your recent expenses and services.
            </p>
        </div>
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><History/> Activity Log</CardTitle>
                <CardDescription>Your last 10 recorded actions.</CardDescription>
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
  );
}
