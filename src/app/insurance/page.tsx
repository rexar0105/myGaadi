import { ShieldCheck, Calendar } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { insurancePolicies } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function InsurancePage() {
    const sortedInsurance = insurancePolicies.sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    
    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold font-headline text-foreground mb-8">
                Insurance Status
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <ShieldCheck className="text-primary" /> Insurance Status
                </CardTitle>
                <CardDescription>Policy renewal dates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {sortedInsurance.map(policy => {
                   const expiryDate = new Date(policy.expiryDate);
                   const daysLeft = differenceInDays(expiryDate, new Date());
                   const isExpired = isPast(expiryDate);
                   const progress = isExpired ? 100 : Math.max(0, 100 - (daysLeft / 365 * 100));

                  return (
                    <div key={policy.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <div>
                            <p className="font-semibold">{policy.vehicleName}</p>
                            <p className="text-sm text-muted-foreground">{policy.provider} - {policy.policyNumber}</p>
                        </div>
                        <p className={cn("text-sm font-medium", isExpired ? 'text-destructive' : 'text-muted-foreground')}>
                          {isExpired ? 'Expired' : `${daysLeft} days left`}
                        </p>
                      </div>
                      <Progress value={progress} className="h-2"/>
                       <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3"/>
                        Expires on {format(expiryDate, "dd MMM yyyy")}
                       </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
        </div>
    )
}
