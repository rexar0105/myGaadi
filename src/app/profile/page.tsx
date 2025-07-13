
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Car, IndianRupee, Wrench, Settings, History, Edit, Save, Calendar as CalendarIcon, Phone, MapPin, Droplets, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { vehicles, expenses, serviceRecords } from "@/lib/data";
import { AppSettings } from "@/components/app-settings";
import { format } from "date-fns";
import { MyDocuments } from "@/components/my-documents";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    dob: z.date().optional(),
    bloodGroup: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const initialProfileData: ProfileFormValues = {
    name: "John Doe",
    dob: new Date("1990-01-01"),
    bloodGroup: "O+",
    phone: "+91 98765 43210",
    address: "123, Main Street, New Delhi, India"
};


export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileFormValues>(initialProfileData);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  const getInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return "?";
    
    const parts = nameOrEmail.split(' ');
    if(parts.length > 1 && parts[0] && parts[1]) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameOrEmail[0].toUpperCase();
  };

  const handleLogout = () => {
    logout();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push("/login");
  };

  function onProfileSubmit(data: ProfileFormValues) {
    setProfile(data);
    setIsEditing(false);
    toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully."
    });
  }

  const totalVehicles = vehicles.length;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalServices = serviceRecords.length;

  const stats = [
    {
      icon: Car,
      label: "Total Vehicles",
      value: totalVehicles,
    },
    {
      icon: IndianRupee,
      label: "Total Expenses",
      value: `₹${totalExpenses.toLocaleString('en-IN')}`,
    },
    {
      icon: Wrench,
      label: "Services Logged",
      value: totalServices,
    },
  ];

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="grid gap-8">
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row justify-between items-start">
            <div className="flex items-center gap-4">
               <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={profile.name || user?.email || ''} />
                  <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
                      {getInitials(profile.name || user?.email || '')}
                  </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-headline text-2xl">{profile.name}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
            <Button variant={isEditing ? "default" : "outline"} size="icon" onClick={() => {
                if (isEditing) {
                    form.handleSubmit(onProfileSubmit)();
                } else {
                    setIsEditing(true);
                    form.reset(profile); 
                }
            }}>
                {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                <span className="sr-only">{isEditing ? 'Save' : 'Edit'}</span>
            </Button>
          </CardHeader>
          <CardContent>
            {isEditing ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="dob"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Date of Birth</FormLabel>
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
                             <FormField
                                control={form.control}
                                name="bloodGroup"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Blood Group</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select blood group" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                                                <SelectItem key={group} value={group}>{group}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                             />
                        </div>
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="+91 98765 43210" {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123, Main Street, City, Country" {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            ) : (
                <div className="space-y-4">
                   <div className="flex items-center text-sm">
                        <UserCircle className="h-4 w-4 mr-3 text-muted-foreground"/>
                        <span className="font-semibold w-28">Full Name</span>
                        <span>{profile.name}</span>
                   </div>
                   <div className="flex items-center text-sm">
                        <CalendarIcon className="h-4 w-4 mr-3 text-muted-foreground"/>
                        <span className="font-semibold w-28">Date of Birth</span>
                        <span>{profile.dob ? format(profile.dob, "do MMMM, yyyy") : 'Not set'}</span>
                   </div>
                   <div className="flex items-center text-sm">
                        <Droplets className="h-4 w-4 mr-3 text-muted-foreground"/>
                        <span className="font-semibold w-28">Blood Group</span>
                        <span>{profile.bloodGroup || 'Not set'}</span>
                   </div>
                    <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-3 text-muted-foreground"/>
                        <span className="font-semibold w-28">Phone Number</span>
                        <span>{profile.phone || 'Not set'}</span>
                   </div>
                   <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-3 text-muted-foreground"/>
                        <span className="font-semibold w-28">Address</span>
                        <span className="flex-1">{profile.address || 'Not set'}</span>
                   </div>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Your Stats</CardTitle>
                <CardDescription>An overview of your activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex items-center gap-4 rounded-lg border p-4 bg-muted/40">
                            <stat.icon className="h-8 w-8 text-primary"/>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <MyDocuments />

        <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><Settings/> App Settings</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <AppSettings />
            </CardContent>
        </Card>

        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
      </div>
    </div>
  );
}
