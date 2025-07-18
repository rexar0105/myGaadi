
"use client";

import React, { useState, useMemo } from "react";
import { IndianRupee, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
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
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useAppContext } from "@/context/app-provider";
import { useSettings } from "@/context/settings-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/context/theme-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const expenseSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  category: z.enum(["Fuel", "Repair", "Insurance", "Other"]),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  description: z.string().min(3, "Description must be at least 3 characters.").max(100, "Description is too long."),
  date: z.date({
    required_error: "A valid date is required.",
  }),
});

const lightChartConfig: ChartConfig = {
    Fuel: { color: "hsl(var(--chart-1))" },
    Repair: { color: "hsl(var(--chart-2))" },
    Insurance: { color: "hsl(var(--chart-3))" },
    Other: { color: "hsl(var(--chart-4))" },
};
  
const darkChartConfig: ChartConfig = {
    Fuel: { color: "hsl(var(--chart-1))" },
    Repair: { color: "hsl(var(--chart-2))" },
    Insurance: { color: "hsl(var(--chart-3))" },
    Other: { color: "hsl(var(--chart-4))" },
};

function ExpenseSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex justify-between items-center">
                    <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ExpensesPageComponent() {
  const { vehicles, expenses, addExpense, isLoading } = useAppContext();
  const { settings } = useSettings();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const chartConfig = theme === 'dark' ? darkChartConfig : lightChartConfig;

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    mode: "onBlur",
    defaultValues: {
      vehicleId: "",
      category: "Fuel",
      amount: 0,
      description: "",
      date: new Date(),
    },
  });

  const descriptionValue = form.watch('description') || '';

  function onSubmit(values: z.infer<typeof expenseSchema>) {
    addExpense({
      ...values,
      date: values.date.toISOString(),
    });

    toast({
      title: "Expense Added!",
      description: `${values.description} has been logged.`,
    });
    setDialogOpen(false);
    form.reset({
      vehicleId: "",
      category: "Fuel",
      amount: 0,
      description: "",
      date: new Date(),
    });
  }

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return settings.defaultSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [expenses, settings.defaultSortOrder]);

  const recentExpenses = useMemo(() => sortedExpenses.slice(0, 10), [sortedExpenses]);

  const { chartData, totalExpenses } = useMemo(() => {
    const expenseByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = { name: expense.category, value: 0 };
      }
      acc[expense.category].value += expense.amount;
      return acc;
    }, {} as { [key: string]: { name: string; value: number } });

    const data = Object.values(expenseByCategory);
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return { chartData: data, totalExpenses: total };
  }, [expenses]);


  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1">
            Expense Tracker
          </h1>
          <p className="text-muted-foreground">
            Keep a log of all your vehicle-related expenses.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.name}
                            </SelectItem>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                        <Textarea
                          placeholder="Full tank of petrol..."
                          {...field}
                          maxLength={100}
                        />
                      </FormControl>
                       <div className="text-xs text-muted-foreground text-right">{`${descriptionValue.length} / 100`}</div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expense Date</FormLabel>
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
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
                  Add Expense
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <ExpenseSkeleton /> : (
        <div className="grid md:grid-cols-2 gap-8">
          <Card
            className="animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-xl">
                <IndianRupee className="text-primary" /> Expense Breakdown
              </CardTitle>
              <CardDescription>
                Total spending of ₹{totalExpenses.toLocaleString("en-IN")}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      labelLine={false}
                      paddingAngle={5}
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            chartConfig[entry.name as keyof typeof chartConfig]
                              ?.color || "#000000"
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <IndianRupee className="h-10 w-10 text-muted-foreground/50"/>
                      <p className="font-medium">No data for chart.</p>
                      <p className="text-sm">Log some expenses to see a breakdown.</p>
                  </div>
              )}
            </CardContent>
          </Card>

          <Card
            className="animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-xl">
                Recent Expenses
              </CardTitle>
              <CardDescription>Last 10 recorded expenses (sorted by {settings.defaultSortOrder === 'newest' ? 'most recent' : 'oldest'})</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {recentExpenses.length > 0 ? recentExpenses.map((expense, index) => (
                  <li
                    key={expense.id}
                    className="flex justify-between items-center animate-fade-in-up"
                    style={{ animationDelay: `${index * 50 + 200}ms` }}
                  >
                    <div>
                      <p className="font-semibold">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.vehicleName} - {expense.category}
                      </p>
                      <p className="text-xs text-muted-foreground/80 mt-1">
                        {format(new Date(expense.date), "dd MMM, yyyy")}
                      </p>
                    </div>
                    <p className="font-mono font-semibold text-foreground text-lg">
                      ₹{expense.amount.toLocaleString("en-IN")}
                    </p>
                  </li>
                )) : (
                  <div className="col-span-full text-center text-muted-foreground py-10 flex flex-col items-center gap-2">
                    <IndianRupee className="h-10 w-10 text-muted-foreground/50" />
                    <p className="font-medium">No expenses logged yet.</p>
                    <p className="text-sm">
                      Click "Add Expense" to get started!
                    </p>
                  </div>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

const ExpensesPage = React.memo(ExpensesPageComponent);
export default ExpensesPage;
