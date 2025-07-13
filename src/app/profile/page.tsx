
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Car, IndianRupee, Wrench, Palette, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { vehicles, expenses, serviceRecords } from "@/lib/data";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const getInitials = (email: string) => {
    if (!email) return "?";
    return email[0].toUpperCase();
  };

  const handleLogout = () => {
    logout();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push("/login");
  };

  const totalVehicles = vehicles.length;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalServices = serviceRecords.length;

  const stats = [
    {
      icon: Car,
      label: "Total Vehicles",
      value: totalVehicles,
    },
    {
      icon: IndianRupee,
      label: "Total Expenses",
      value: `₹${totalExpenses.toLocaleString('en-IN')}`,
    },
    {
      icon: Wrench,
      label: "Services Logged",
      value: totalServices,
    }
  ];

  const recentActivity = [
    ...expenses.map(e => ({ type: 'expense' as const, ...e})),
    ...serviceRecords.map(s => ({ type: 'service' as const, ...s}))
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5);


  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="grid gap-8">
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <div className="flex items-center gap-4">
               <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || ''} />
                  <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
                      {user ? getInitials(user.email) : <User />}
                  </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-headline text-2xl">{user?.email}</CardTitle>
                <CardDescription>Member since {new Date().getFullYear()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <Separator />
          </CardContent>
          <CardFooter>
               <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
          </CardFooter>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><Settings/> App Settings</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSwitcher />
            </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Your Stats</CardTitle>
                <CardDescription>An overview of your activity.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-4 rounded-lg border p-4 bg-muted/40">
                        <stat.icon className="h-8 w-8 text-primary"/>
                        <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
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
