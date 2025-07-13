
"use client";

import { useState } from "react";
import { Wrench, PlusCircle } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
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
import { cn } from "@/lib/utils";
import { useData } from "@/context/data-context";

const serviceSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  service: z.string().min(1, "Service description is required"),
  date: z.string().min(1, "Date is required"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  notes: z.string().optional(),
  nextDueDate: z.string().optional(),
});


export default function ServicesPage() {
    const { vehicles, serviceRecords, addServiceRecord } = useData();
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
        const { vehicleId, service, date, cost, notes, nextDueDate } = values;
        addServiceRecord({ vehicleId, service, date, cost, notes, nextDueDate });
        
        const vehicleName = vehicles.find(v => v.id === values.vehicleId)?.name || 'Unknown Vehicle';
        toast({
            title: "Service Logged!",
            description: `${values.service} for ${vehicleName} has been recorded.`,
        });
        setDialogOpen(false);
        form.reset({
             vehicleId: "",
            service: "",
            date: new Date().toISOString().split("T")[0],
            cost: 0,
            notes: "",
            nextDueDate: "",
        });
    }

    const upcomingServices = serviceRecords
    .filter((s) => s.nextDueDate && !isPast(new Date(s.nextDueDate)))
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());

    const serviceHistory = [...serviceRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    return (
        <div className="p-4 md:p-8 animate-fade-in">
             <div className="flex items-center justify-between mb-8">
                 <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                        Service Center
                    </h1>
                    <p className="text-muted-foreground">Log service history and track upcoming maintenance.</p>
                </div>
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
                                                <Input placeholder="e.g., General Service, Tire Change" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            <FormLabel>Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="e.g., Oil change, filter replacement..." {...field} />
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
            <div className="grid gap-8">
                <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-xl">
                      <Wrench className="text-primary" /> Upcoming Services
                    </CardTitle>
                    <CardDescription>Scheduled maintenance and checks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {upcomingServices.length > 0 ? upcomingServices.map((service, index) => {
                        const dueDate = new Date(service.nextDueDate!);
                        const daysLeft = differenceInDays(dueDate, new Date());
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
                               <p className="text-xs text-muted-foreground mt-1">Due on: {format(dueDate, "dd MMM, yyyy")}</p>
                              {index < upcomingServices.length -1 && <Separator className="my-3"/>}
                            </li>
                        )
                      }) : (
                          <div className="text-center text-muted-foreground py-4 flex flex-col items-center gap-2">
                            <Wrench className="h-10 w-10 text-muted-foreground/50"/>
                            <p className="font-medium">No upcoming services.</p>
                            <p className="text-sm">You're all caught up!</p>
                        </div>
                      )}
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
                            {serviceHistory.length > 0 ? serviceHistory.map((record, index) => (
                                <li 
                                  key={record.id}
                                  className={cn(
                                    "animate-fade-in-up",
                                    index < serviceHistory.length - 1 && "pb-4 border-b"
                                    )}
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
                                </li>
                            )) : (
                                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-2">
                                    <Wrench className="h-10 w-10 text-muted-foreground/50"/>
                                    <p className="font-medium">No services logged yet.</p>
                                    <p className="text-sm">Click "Add Service" to get started!</p>
                                </div>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
