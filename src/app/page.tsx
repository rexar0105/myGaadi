import Image from "next/image";
import {
  Car,
  IndianRupee,
  ShieldCheck,
  Wrench,
  Calendar,
} from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { vehicles, serviceRecords, expenses, insurancePolicies } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { ConditionAssessment } from "@/components/condition-assessment";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const upcomingServices = serviceRecords
    .filter((s) => s.nextDueDate && !isPast(new Date(s.nextDueDate)))
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());

  const recentExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const sortedInsurance = insurancePolicies.sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-1">
        <h2 className="text-3xl font-bold font-headline text-foreground mb-6">
          Dashboard
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Your Vehicles */}
            <Card className="shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Car className="text-primary" /> Your Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="rounded-lg border p-4 flex flex-col gap-4 bg-background hover:bg-muted/50 transition-colors">
                    <Image
                      src={vehicle.imageUrl}
                      alt={vehicle.name}
                      width={400}
                      height={200}
                      className="rounded-md object-cover"
                      data-ai-hint={vehicle.dataAiHint}
                    />
                    <div>
                      <h3 className="font-bold font-headline">{vehicle.name}</h3>
                      <p className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                      <p className="text-sm font-mono mt-1 bg-muted/60 inline-block px-2 py-1 rounded-md">{vehicle.registrationNumber}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Condition Assessment */}
            <ConditionAssessment />
          </div>

          <div className="space-y-8">
            {/* Upcoming Services */}
            <Card className="shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Wrench className="text-primary" /> Upcoming Services
                </CardTitle>
                <CardDescription>Scheduled maintenance and checks</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {upcomingServices.map((service, index) => {
                    const dueDate = new Date(service.nextDueDate!);
                    const daysLeft = differenceInDays(dueDate, new Date());
                    const urgency = daysLeft < 7 ? "destructive" : daysLeft < 30 ? "secondary" : "default";
                    
                    return (
                        <li key={service.id}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{service.service}</p>
                              <p className="text-sm text-muted-foreground">{service.vehicleName}</p>
                            </div>
                            <Badge variant={urgency === 'default' ? 'outline' : urgency}>
                              {format(dueDate, "dd MMM, yyyy")}
                            </Badge>
                          </div>
                          {index < upcomingServices.length -1 && <Separator className="my-3"/>}
                        </li>
                    )
                  })}
                  {upcomingServices.length === 0 && <p className="text-muted-foreground text-sm">No upcoming services scheduled.</p>}
                </ul>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card className="shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <IndianRupee className="text-primary" /> Recent Expenses
                </CardTitle>
                <CardDescription>Last 5 recorded expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <li key={expense.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">{expense.vehicleName} - {expense.category}</p>
                      </div>
                      <p className="font-mono font-semibold text-foreground">₹{expense.amount.toLocaleString('en-IN')}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Insurance Status */}
            <Card className="shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <ShieldCheck className="text-primary" /> Insurance Status
                </CardTitle>
                <CardDescription>Policy renewal dates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedInsurance.map(policy => {
                   const expiryDate = new Date(policy.expiryDate);
                   const daysLeft = differenceInDays(expiryDate, new Date());
                   const isExpired = isPast(expiryDate);
                   const progress = isExpired ? 100 : Math.max(0, 100 - (daysLeft / 365 * 100));
                   let colorClass = 'bg-green-500';
                   if (daysLeft < 30) colorClass = 'bg-yellow-500';
                   if (daysLeft < 7) colorClass = 'bg-red-500';
                   if (isExpired) colorClass = 'bg-destructive';

                  return (
                    <div key={policy.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="font-semibold">{policy.vehicleName}</p>
                        <p className={cn("text-sm font-medium", isExpired ? 'text-destructive' : '')}>
                          {isExpired ? 'Expired' : `${daysLeft} days left`}
                        </p>
                      </div>
                      <Progress value={progress} className="h-2 [&>div]:bg-primary"/>
                       <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3"/>
                        Expires on {format(expiryDate, "dd MMM yyyy")}
                       </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
