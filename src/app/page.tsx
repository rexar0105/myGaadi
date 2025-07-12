
"use client";

import { useState } from "react";
import Image from "next/image";
import { Car, PlusCircle, Wrench } from "lucide-react";
import { vehicles as initialVehicles, serviceRecords } from "@/lib/data";
import type { Vehicle } from "@/lib/types";
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
import { cn } from "@/lib/utils";
import { differenceInDays, isPast, format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const vehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1),
  registrationNumber: z.string().min(1, "Registration number is required"),
});

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      registrationNumber: "",
    },
  });

  function onSubmit(values: z.infer<typeof vehicleSchema>) {
    const newVehicle: Vehicle = {
      id: `v${vehicles.length + 1}`,
      ...values,
      imageUrl: "https://placehold.co/600x400.png",
      dataAiHint: `${values.make.toLowerCase()} ${values.model.toLowerCase()}`,
    };
    setVehicles((prev) => [...prev, newVehicle]);
    toast({
      title: "Vehicle Added!",
      description: `${values.name} has been added to your garage.`,
    });
    setDialogOpen(false);
    form.reset();
  }

  const upcomingServices = serviceRecords
    .filter((s) => {
        if (!s.nextDueDate || isPast(new Date(s.nextDueDate))) {
            return false;
        }
        const daysLeft = differenceInDays(new Date(s.nextDueDate), new Date());
        return daysLeft <= 14;
    })
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());

  return (
    <main className="p-4 md:p-8 flex-1 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
                Your Garage
            </h1>
            <p className="text-muted-foreground">Manage all your registered vehicles.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Vehicle</DialogTitle>
              <DialogDescription>
                Enter the details of your new vehicle.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Name (e.g. My Swift)</FormLabel>
                      <FormControl>
                        <Input placeholder="My Red Car" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="Maruti Suzuki" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Swift VXI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2021" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration No.</FormLabel>
                        <FormControl>
                          <Input placeholder="MH 12 AB 3456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 </div>
                <Button type="submit" className="w-full">Add Vehicle</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8">
        {upcomingServices.length > 0 && (
            <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-xl">
                      <Wrench className="text-primary" /> Service Reminders
                    </CardTitle>
                    <CardDescription>Your next upcoming services due within 14 days.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-4">
                      {upcomingServices.map((service, index) => {
                        const dueDate = new Date(service.nextDueDate!);
                        const daysLeft = differenceInDays(dueDate, new Date());
                        const urgency = daysLeft < 7 ? "destructive" : "secondary";
                        
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
                                <Badge variant={urgency}>
                                  {daysLeft <= 0 ? "Due Today" : `${daysLeft} days left`}
                                </Badge>
                              </div>
                               <p className="text-xs text-muted-foreground mt-1">Due on: {format(dueDate, "dd MMM, yyyy")}</p>
                              {index < upcomingServices.length -1 && <Separator className="my-3"/>}
                            </li>
                        )
                      })}
                    </ul>
                </CardContent>
            </Card>
        )}

        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-xl">
                <Car className="text-primary" /> Registered Vehicles
            </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => (
                <div 
                key={vehicle.id} 
                className="rounded-2xl border bg-card hover:border-primary/50 transition-colors animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
                >
                <div className="overflow-hidden rounded-t-2xl">
                    <Image
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        width={400}
                        height={200}
                        className="rounded-t-lg object-cover aspect-video group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={vehicle.dataAiHint}
                    />
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-xl font-headline">{vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                    <p className="text-sm font-mono mt-2 bg-secondary/70 text-secondary-foreground inline-block px-2 py-1 rounded-md">{vehicle.registrationNumber}</p>
                </div>
                </div>
            ))}
            {vehicles.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-10 flex flex-col items-center gap-2">
                    <Car className="h-10 w-10 text-muted-foreground/50"/>
                    <p className="font-medium">No vehicles in your garage yet.</p>
                    <p className="text-sm">Click "Add Vehicle" to get started!</p>
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
