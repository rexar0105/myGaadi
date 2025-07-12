import { Wrench, Calendar } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { serviceRecords } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function ServicesPage() {
    const upcomingServices = serviceRecords
    .filter((s) => s.nextDueDate && !isPast(new Date(s.nextDueDate)))
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());

    return (
        <div className="p-4 md:p-8">
             <h2 className="text-3xl font-bold font-headline text-foreground mb-8">
                Upcoming Services
            </h2>
            <Card>
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
        </div>
    )
}
