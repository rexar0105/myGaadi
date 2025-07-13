
"use client";

import { useState } from "react";
import Image from "next/image";
import { Car, PlusCircle, Wrench, ShieldCheck, Calendar, Info, Pencil, Upload } from "lucide-react";
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
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useData } from "@/context/data-context";

const vehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1),
  registrationNumber: z.string().min(1, "Registration number is required"),
  image: z.any().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

function EditVehicleForm({ vehicle, onSave }: { vehicle: Vehicle, onSave: (data: VehicleFormValues, vehicleId: string) => void }) {
    const { toast } = useToast();
    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            name: vehicle.name,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            registrationNumber: vehicle.registrationNumber,
        }
    });

    const currentImageFile = form.watch('image');
    const currentImageName = currentImageFile?.[0]?.name;


    const onSubmit = (data: VehicleFormValues) => {
        onSave(data, vehicle.id);
    }
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Vehicle</DialogTitle>
                <DialogDescription>Update the details of your vehicle.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vehicle Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="My Red Car" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                     <FormField
                        control={form.control}
                        name="image"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Vehicle Image</FormLabel>
                                <FormControl>
                                    <div>
                                        <Input 
                                            id="edit-image-upload"
                                            type="file" 
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => onChange(e.target.files)}
                                            {...rest}
                                        />
                                        <Button asChild variant="outline" className="w-full font-normal">
                                            <label htmlFor="edit-image-upload" className="w-full cursor-pointer">
                                                <Upload className="mr-2"/>
                                                <span className="truncate max-w-[calc(100%-2rem)]">
                                                    {currentImageName ?? 'Upload a new image...'}
                                                </span>
                                            </label>
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="submit" className="w-full">Save Changes</Button>
                </form>
            </Form>
        </DialogContent>
    );
}


export default function DashboardPage() {
  const { vehicles, serviceRecords, insurancePolicies, addVehicle, updateVehicle } = useData();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const { toast } = useToast();

  const addVehicleForm = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      registrationNumber: "",
    },
  });

  const newImageFile = addVehicleForm.watch('image');
  const newImageName = newImageFile?.[0]?.name;


  function onAddVehicleSubmit(values: z.infer<typeof vehicleSchema>) {
    const newVehicleData = {
      name: values.name,
      make: values.make,
      model: values.model,
      year: values.year,
      registrationNumber: values.registrationNumber,
      imageUrl: "https://placehold.co/600x400.png",
      customImageUrl: values.image?.[0] ? URL.createObjectURL(values.image[0]) : undefined,
      dataAiHint: `${values.make.toLowerCase()} ${values.model.toLowerCase()}`,
    };
    addVehicle(newVehicleData);
    toast({
      title: "Vehicle Added!",
      description: `${values.name} has been added to your garage.`,
    });
    setAddDialogOpen(false);
    addVehicleForm.reset();
  }

  const handleEditVehicleSave = (data: VehicleFormValues, vehicleId: string) => {
    const newImageUrl = data.image?.[0] ? URL.createObjectURL(data.image[0]) : (vehicles.find(v => v.id === vehicleId)?.customImageUrl);
    const updatedData = {
        ...data,
        customImageUrl: newImageUrl,
    }
    updateVehicle(vehicleId, updatedData);
    
    toast({
        title: "Vehicle Updated!",
        description: "Your vehicle details have been saved."
    })
    setEditingVehicle(null);
  }

  const handleCardClick = (vehicleId: string) => {
    if (!editingVehicle) {
        setFlippedCardId(prevId => prevId === vehicleId ? null : vehicleId);
    }
  }

  return (
    <main className="p-4 md:p-8 flex-1 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
                Your Garage
            </h1>
            <p className="text-muted-foreground">Manage all your registered vehicles.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
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
            <Form {...addVehicleForm}>
              <form onSubmit={addVehicleForm.handleSubmit(onAddVehicleSubmit)} className="space-y-4">
                <FormField
                  control={addVehicleForm.control}
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
                 <FormField
                    control={addVehicleForm.control}
                    name="image"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                        <FormLabel>Vehicle Image (Optional)</FormLabel>
                        <FormControl>
                           <div>
                             <Input 
                                id="new-image-upload"
                                type="file" 
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => onChange(e.target.files)}
                                {...rest}
                             />
                             <Button asChild variant="outline" className="w-full font-normal">
                               <label htmlFor="new-image-upload" className="w-full cursor-pointer">
                                 <Upload className="mr-2"/>
                                 <span className="truncate max-w-[calc(100%-2rem)]">
                                    {newImageName ?? 'Upload an image...'}
                                 </span>
                               </label>
                             </Button>
                           </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={addVehicleForm.control}
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
                    control={addVehicleForm.control}
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
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={addVehicleForm.control}
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
                    control={addVehicleForm.control}
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

       <Dialog open={!!editingVehicle} onOpenChange={(isOpen) => !isOpen && setEditingVehicle(null)}>
           {editingVehicle && <EditVehicleForm vehicle={editingVehicle} onSave={handleEditVehicleSave} />}
       </Dialog>


      <div className="grid gap-8">
        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-xl">
                <Car className="text-primary" /> Registered Vehicles
            </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => {
              const lastService = serviceRecords.filter(s => s.vehicleId === vehicle.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              const insurance = insurancePolicies.find(p => p.vehicleId === vehicle.id);

              return (
                  <div 
                    key={vehicle.id}
                    className="perspective-container animate-fade-in-up min-h-[350px]"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleCardClick(vehicle.id)}
                  >
                    <div className={cn("card-flipper w-full h-full relative", flippedCardId === vehicle.id && "is-flipped")}>
                      {/* Front of Card */}
                      <div className="card-front absolute w-full h-full rounded-lg border bg-card hover:border-primary/50 transition-colors group cursor-pointer shadow-sm flex flex-col">
                          <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 z-10 h-8 w-8 bg-black/30 hover:bg-black/50 text-white hover:text-white opacity-50 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingVehicle(vehicle);
                              }}
                          >
                              <Pencil className="h-4 w-4" />
                          </Button>
                          <div className="overflow-hidden rounded-t-lg">
                              <Image
                                  src={vehicle.customImageUrl || vehicle.imageUrl}
                                  alt={vehicle.name}
                                  width={400}
                                  height={200}
                                  className="rounded-t-lg object-cover aspect-video group-hover:scale-105 transition-transform duration-300"
                                  data-ai-hint={vehicle.dataAiHint}
                              />
                          </div>
                          <div className="p-4 flex flex-col flex-grow">
                              <h3 className="font-bold text-xl font-headline">{vehicle.name}</h3>
                              <p className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                              <div className="flex-grow" />
                              <p className="text-sm font-mono mt-2 bg-secondary/70 text-secondary-foreground inline-block px-2 py-1 rounded-md self-start">{vehicle.registrationNumber}</p>
                          </div>
                          <div className="absolute bottom-2 right-3 text-muted-foreground/50 text-xs flex items-center gap-1">
                            <Info className="h-3 w-3" /> Click for details
                          </div>
                      </div>

                      {/* Back of Card */}
                      <div className="card-back absolute w-full h-full rounded-lg border bg-card p-4 flex flex-col gap-3 justify-center shadow-sm">
                          <h3 className="font-bold text-xl font-headline text-center -mt-4">{vehicle.name}</h3>
                           <div className="space-y-3 text-sm">
                             {lastService && (
                                <div className="flex items-start gap-3">
                                  <Wrench className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold">Last Service</p>
                                    <p className="text-muted-foreground">{lastService.service} on {format(new Date(lastService.date), "dd MMM, yyyy")}</p>
                                  </div>
                                </div>
                              )}
                              {lastService?.nextDueDate && (
                                <div className="flex items-start gap-3">
                                  <Calendar className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold">Next Service</p>
                                    <p className="text-muted-foreground">Due in {differenceInDays(new Date(lastService.nextDueDate), new Date())} days</p>
                                  </div>
                                </div>
                              )}
                              {insurance && (
                                <div className="flex items-start gap-3">
                                  <ShieldCheck className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold">Insurance</p>
                                    <p className="text-muted-foreground">Expires in {differenceInDays(new Date(insurance.expiryDate), new Date())} days</p>
                                  </div>
                                </div>
                              )}
                              {!lastService && !insurance && (
                                <p className="text-center text-muted-foreground">No service or insurance data found.</p>
                              )}
                          </div>
                      </div>
                    </div>
                </div>
              )
            })}
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
