
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
import { LogOut, User, Car, IndianRupee, Wrench, Settings, History, Edit, Save, Calendar as CalendarIcon, Phone, MapPin, Droplets, UserCircle, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
import { useData } from "@/context/data-context";

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

const AppLogoMini = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 3C8.82 3 3 8.82 3 16s5.82 13 13 13 13-5.82 13-13S23.18 3 16 3zm0 2c6.075 0 11 4.925 11 11s-4.925 11-11 11S5 22.075 5 16 9.925 5 16 5z" fill="hsl(var(--primary))" fillOpacity="0.2"/>
      <path d="M16.064 10.339c-3.153 0-5.71 2.556-5.71 5.71s2.557 5.71 5.71 5.71c3.154 0 5.71-2.556 5.71-5.71s-2.556-5.71-5.71-5.71zm.001 2.057a3.655 3.655 0 110 7.31 3.655 3.655 0 010-7.31z" fill="hsl(var(--primary))" />
      <path d="M19.982 11.082l2.96 2.457-4.48 5.418-2.96-2.457 4.48-5.418z" fill="hsl(var(--primary))"/>
    </svg>
)

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { vehicles, expenses, serviceRecords } = useData();
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
             <div>
                <CardTitle className="font-headline text-2xl">User Profile</CardTitle>
                <CardDescription>Your personal information and app settings</CardDescription>
             </div>

            <Button variant={isEditing ? "default" : "outline"} size="sm" className="gap-2" onClick={() => {
                if (isEditing) {
                    form.handleSubmit(onProfileSubmit)();
                } else {
                    setIsEditing(true);
                    form.reset(profile); 
                }
            }}>
                {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                <span>{isEditing ? 'Save' : 'Edit'}</span>
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
              <div className="rounded-xl border bg-card p-4 font-sans text-sm max-w-2xl mx-auto shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center border-b-2 border-primary/20 pb-2 mb-4">
                    <div className="text-left">
                        <p className="font-bold text-primary text-lg tracking-wider">myGaadi ID</p>
                        <p className="text-xs text-muted-foreground font-medium tracking-widest">VIRTUAL ID</p>
                    </div>
                    <AppLogoMini />
                </div>
                
                {/* Body */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <Avatar className="h-32 w-28 rounded-lg border-4 border-muted shadow-md">
                        <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={profile.name || user?.email || ''} />
                        <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold rounded-lg">
                            {getInitials(profile.name || user?.email || '')}
                        </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="mb-2">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">NAME</p>
                        <p className="font-bold text-xl text-foreground -mt-1">{profile.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">ADDRESS</p>
                        <p className="font-medium text-foreground text-base">{profile.address || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">DOB</p>
                        <p className="font-mono font-semibold text-foreground text-base">{profile.dob ? format(profile.dob, "dd-MM-yyyy") : 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">BLOOD</p>
                        <p className="font-mono font-semibold text-foreground text-base">{profile.bloodGroup || 'Not set'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">EMAIL</p>
                        <p className="font-medium text-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer / Signature */}
                <div className="flex justify-between items-end mt-2">
                    <div className="text-left">
                        <p className="font-mono text-xs text-muted-foreground">Class: ALL</p>
                        <p className="font-mono text-xs text-muted-foreground">Expires: NEVER</p>
                    </div>
                    <div className="w-2/5">
                        <p className="font-serif text-2xl text-foreground/80 border-b border-muted-foreground pb-1 text-center italic">{profile.name}</p>
                        <p className="text-xs text-muted-foreground text-center font-semibold tracking-wide">SIGNATURE</p>
                    </div>
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
