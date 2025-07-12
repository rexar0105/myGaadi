
"use client";

import { useState } from "react";
import Image from "next/image";
import { Car, PlusCircle } from "lucide-react";
import { vehicles as initialVehicles } from "@/lib/data";
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
import { Label } from "@/components/ui/label";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <main className="p-4 md:p-8 flex-1">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold font-headline text-foreground">
          Your Vehicles
        </h2>
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
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Car className="text-primary" /> Registered Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="rounded-2xl border p-4 flex flex-col gap-4 bg-card hover:bg-muted/50 transition-colors">
              <Image
                src={vehicle.imageUrl}
                alt={vehicle.name}
                width={400}
                height={200}
                className="rounded-lg object-cover aspect-video"
                data-ai-hint={vehicle.dataAiHint}
              />
              <div>
                <h3 className="font-bold text-xl font-headline">{vehicle.name}</h3>
                <p className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                <p className="text-sm font-mono mt-2 bg-secondary/70 text-secondary-foreground inline-block px-2 py-1 rounded-md">{vehicle.registrationNumber}</p>
              </div>
            </div>
          ))}
           {vehicles.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              <p>No vehicles yet. Click &quot;Add Vehicle&quot; to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
