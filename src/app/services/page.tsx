
"use client";

import { useState } from "react";
import { Wrench, PlusCircle } from "lucide-react";
import { format, isPast } from "date-fns";
import { serviceRecords as initialRecords, vehicles } from "@/lib/data";
import type { ServiceRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const serviceSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  service: z.string().min(1, "Service description is required"),
  date: z.string().min(1, "Date is required"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  notes: z.string().optional(),
  nextDueDate: z.string().optional(),
});


export default function ServicesPage() {
    const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>(initialRecords);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof serviceSchema>>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            vehicleId: "",
            service: "",
            date: new Date().toISOString().split("T")[0],
            cost: 0,
            notes: "",
            nextDueDate: "",
        },
    });

    function onSubmit(values: z.infer<typeof serviceSchema>) {
        const vehicleName = vehicles.find(v => v.id === values.vehicleId)?.name || 'Unknown Vehicle';
        const newRecord: ServiceRecord = {
            id: `s${serviceRecords.length + 1}`,
            ...values,
            vehicleName: vehicleName,
        };
        setServiceRecords(prev => [newRecord, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast({
            title: "Service Logged!",
            description: `${values.service} for ${vehicleName} has been recorded.`,
        });
        setDialogOpen(false);
        form.reset();
        form.setValue("date", new Date().toISOString().split("T")[0]);
    }

    const upcomingServices = serviceRecords
    .filter((s) => s.nextDueDate && !isPast(new Date(s.nextDueDate)))
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());

    const serviceHistory = [...serviceRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    return (
        <div className="p-4 md:p-8 animate-fade-in">
             <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-bold font-headline text-foreground">
                    Services
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle />
                            Add Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log a New Service</DialogTitle>
                            <DialogDescription>
                                Enter the details of the service performed.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="vehicleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a vehicle" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {vehicles.map(vehicle => (
                                                        <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="service"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Service Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="General Service" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Service Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cost (₹)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="2500" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Oil change, filter replacement..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nextDueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Next Service Due Date (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Log Service</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid gap-6">
                <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-xl">
                      <Wrench className="text-primary" /> Upcoming Services
                    </CardTitle>
                    <CardDescription>Scheduled maintenance and checks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {upcomingServices.map((service, index) => {
                        const dueDate = new Date(service.nextDueDate!);
                        const daysLeft = Math.max(0, Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                        const urgency = daysLeft < 7 ? "destructive" : daysLeft < 30 ? "secondary" : "default";
                        
                        return (
                            <li 
                              key={service.id}
                              className="animate-fade-in-up"
                              style={{ animationDelay: `${index * 50 + 200}ms` }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold">{service.service}</p>
                                  <p className="text-sm text-muted-foreground">{service.vehicleName}</p>
                                </div>
                                <Badge variant={urgency === 'default' ? 'outline' : urgency}>
                                  {daysLeft} days left
                                </Badge>
                              </div>
                               <p className="text-xs text-muted-foreground mt-1">{format(dueDate, "dd MMM, yyyy")}</p>
                              {index < upcomingServices.length -1 && <Separator className="my-3"/>}
                            </li>
                        )
                      })}
                      {upcomingServices.length === 0 && <p className="text-muted-foreground text-center py-4 text-sm">No upcoming services scheduled.</p>}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Service History</CardTitle>
                        <CardDescription>All recorded services for your vehicles</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ul className="space-y-4">
                            {serviceHistory.map((record, index) => (
                                <li 
                                  key={record.id}
                                  className="animate-fade-in-up"
                                  style={{ animationDelay: `${index * 50 + 300}ms` }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{record.service}</p>
                                            <p className="text-sm text-muted-foreground">{record.vehicleName}</p>
                                            <p className="text-xs text-muted-foreground/80 mt-1">{format(new Date(record.date), 'dd MMM, yyyy')}</p>
                                        </div>
                                        <p className="font-mono font-semibold text-foreground text-lg">₹{record.cost.toLocaleString('en-IN')}</p>
                                    </div>
                                    {record.notes && <p className="text-sm text-muted-foreground mt-2 bg-secondary/30 p-2 rounded-md">{record.notes}</p>}
                                    {index < serviceHistory.length - 1 && <Separator className="my-4" />}
                                </li>
                            ))}
                            {serviceHistory.length === 0 && (
                                <div className="text-center text-muted-foreground py-10">
                                    <p>No services logged yet. Click &quot;Add Service&quot; to get started!</p>
                                </div>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
