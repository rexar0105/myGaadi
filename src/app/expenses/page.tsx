
"use client";

import { useState } from "react";
import { IndianRupee, PlusCircle } from "lucide-react";
import { expenses as initialExpenses, vehicles } from "@/lib/data";
import type { Expense } from "@/lib/types";
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
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

const expenseSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  category: z.enum(["Fuel", "Repair", "Insurance", "Other"]),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  date: z.string(),
});

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof expenseSchema>>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            vehicleId: "",
            category: "Fuel",
            amount: 0,
            description: "",
            date: new Date().toISOString(),
        },
    });

    function onSubmit(values: z.infer<typeof expenseSchema>) {
        const vehicleName = vehicles.find(v => v.id === values.vehicleId)?.name || 'Unknown Vehicle';
        const newExpense: Expense = {
            id: `e${expenses.length + 1}`,
            ...values,
            vehicleName: vehicleName
        };
        setExpenses(prev => [newExpense, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast({
            title: "Expense Added!",
            description: `${values.description} has been logged.`,
        });
        setDialogOpen(false);
        form.reset();
        form.setValue("date", new Date().toISOString());
    }
    
    const recentExpenses = expenses.slice(0, 10);

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold font-headline text-foreground">
                    Recent Expenses
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle />
                            Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Expense</DialogTitle>
                            <DialogDescription>
                                Enter the details of your expense.
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
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Fuel">Fuel</SelectItem>
                                                    <SelectItem value="Repair">Repair</SelectItem>
                                                    <SelectItem value="Insurance">Insurance</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="1500" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Full tank of petrol..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Add Expense</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                  <IndianRupee className="text-primary" /> Recent Expenses
                </CardTitle>
                <CardDescription>Last 10 recorded expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {recentExpenses.map((expense) => (
                    <li key={expense.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">{expense.vehicleName} - {expense.category}</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">{format(new Date(expense.date), 'dd MMM, yyyy')}</p>
                      </div>
                      <p className="font-mono font-semibold text-foreground text-lg">₹{expense.amount.toLocaleString('en-IN')}</p>
                    </li>
                  ))}
                   {recentExpenses.length === 0 && (
                        <div className="col-span-full text-center text-muted-foreground py-10">
                            <p>No expenses logged yet. Click &quot;Add Expense&quot; to get started!</p>
                        </div>
                    )}
                </ul>
              </CardContent>
            </Card>
        </div>
    )
}
