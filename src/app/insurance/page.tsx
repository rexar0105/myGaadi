
"use client";

import { useState } from "react";
import { ShieldCheck, Calendar, PlusCircle } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import type { InsurancePolicy } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

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
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/app-provider";

const insuranceSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  provider: z.string().min(2, "Provider name must be at least 2 characters."),
  policyNumber: z.string().min(5, "Policy number must be at least 5 characters."),
  expiryDate: z.date({
    required_error: "Expiry date is required.",
  }),
});


export default function InsurancePage() {
    const { vehicles, insurancePolicies, addInsurancePolicy } = useAppContext();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof insuranceSchema>>({
        resolver: zodResolver(insuranceSchema),
        mode: "onBlur",
        defaultValues: {
            vehicleId: "",
            provider: "",
            policyNumber: "",
        },
    });

    function onSubmit(values: z.infer<typeof insuranceSchema>) {
        const policyData = {
            ...values,
            expiryDate: values.expiryDate.toISOString(),
        }
        addInsurancePolicy(policyData);
        
        const vehicleName = vehicles.find(v => v.id === values.vehicleId)?.name || 'Unknown Vehicle';
        toast({
            title: "Insurance Added!",
            description: `Policy for ${vehicleName} has been added.`,
        });
        setDialogOpen(false);
        form.reset();
    }
    
    const sortedInsurance = [...insurancePolicies].sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    
    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                 <div>
                    <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1">
                        Insurance Manager
                    </h1>
                    <p className="text-muted-foreground">Keep track of your vehicle insurance policies.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <PlusCircle />
                            Add Policy
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Insurance Policy</DialogTitle>
                            <DialogDescription>
                                Enter the details of the new insurance policy.
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
                                    name="provider"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Provider</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Go Digit, Acko, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="policyNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Policy Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="POL12345678" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="expiryDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Expiry Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarPicker
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <Button type="submit" className="w-full" disabled={!form.formState.isValid}>Add Policy</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                  <ShieldCheck className="text-primary" /> Insurance Status
                </CardTitle>
                <CardDescription>Policy renewal dates for all your vehicles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {sortedInsurance.map((policy, index) => {
                   const expiryDate = new Date(policy.expiryDate);
                   const daysLeft = differenceInDays(expiryDate, new Date());
                   const isExpired = isPast(expiryDate);
                   const totalDuration = 365; // Assuming a 1 year policy
                   const daysPassed = totalDuration - Math.max(0, daysLeft);
                   const progress = isExpired ? 100 : Math.min(100, (daysPassed / totalDuration) * 100);

                  return (
                    <div 
                      key={policy.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50 + 200}ms` }}
                    >
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
                {sortedInsurance.length === 0 && (
                    <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-2">
                        <ShieldCheck className="h-10 w-10 text-muted-foreground/50"/>
                        <p className="font-medium">No insurance policies added yet.</p>
                        <p className="text-sm">Click "Add Policy" to get started!</p>
                    </div>
                )}
              </CardContent>
            </Card>
        </div>
    )
}
