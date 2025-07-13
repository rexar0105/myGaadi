
"use client";

import { useState, useEffect } from "react";
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
import { LogOut, User, Car, IndianRupee, Wrench, Settings, History, Edit, Save, Calendar as CalendarIcon, Phone, MapPin, Droplets, UserCircle, PenLine, Shield, FileText, Upload, HeartPulse, Smartphone, File, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AppSettings } from "@/components/app-settings";
import { format, differenceInDays, isPast } from "date-fns";
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
    licenseNumber: z.string().optional(),
    licenseExpiryDate: z.date().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    avatar: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export type ProfileState = Omit<ProfileFormValues, 'avatar' | 'dob' | 'licenseExpiryDate'> & {
    dob?: string, // Stored as ISO string
    licenseExpiryDate?: string, // Stored as ISO string
    avatarUrl: string | null
};

const IndianFlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" {...props}>
      <rect width="900" height="600" fill="#f93"/>
      <rect y="200" width="900" height="200" fill="#fff"/>
      <rect y="400" width="900" height="200" fill="#128807"/>
      <g transform="translate(450 300)">
        <circle r="90" fill="#000080"/>
        <circle r="80" fill="#fff"/>
        <circle r="3.5" fill="#000080"/>
        <g id="d">
          <g id="c">
            <g id="b">
              <g id="a">
                <path d="M0-80V0h40" fill="none" stroke="#000080" strokeWidth="10"/>
              </g>
              <use href="#a" transform="rotate(15)"/>
            </g>
            <use href="#b" transform="rotate(30)"/>
          </g>
          <use href="#c" transform="rotate(60)"/>
        </g>
        <use href="#d" transform="rotate(120)"/>
        <use href="#d" transform="rotate(240)"/>
      </g>
    </svg>
  );

  const getInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return "?";
    
    const parts = nameOrEmail.split(' ').filter(Boolean);
    if(parts.length > 1 && parts[0] && parts[1]) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameOrEmail[0].toUpperCase();
  };


export default function ProfilePage() {
  const { user, logout, profile, setProfile } = useAuth();
  const { vehicles, expenses, serviceRecords, documents, insurancePolicies, isLoading: isDataLoading } = useData();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    // Default values will be set once profile is loaded
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        ...profile,
        dob: profile.dob ? new Date(profile.dob) : undefined,
        licenseExpiryDate: profile.licenseExpiryDate ? new Date(profile.licenseExpiryDate) : undefined,
        avatar: undefined,
      });
      setIsLoadingProfile(false);
    }
  }, [profile, form]);


  const handleLogout = () => {
    logout();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push("/login");
  };

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user || !profile) return;
    
    const newAvatarFile = data.avatar?.[0];
    let newAvatarUrl = profile.avatarUrl;

    if (newAvatarFile) {
        newAvatarUrl = URL.createObjectURL(newAvatarFile);
    }
    
    const updatedProfileData: ProfileState = {
        name: data.name,
        dob: data.dob?.toISOString(),
        bloodGroup: data.bloodGroup,
        phone: data.phone,
        address: data.address,
        licenseNumber: data.licenseNumber,
        licenseExpiryDate: data.licenseExpiryDate?.toISOString(),
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        avatarUrl: newAvatarUrl
    };
    
    setProfile(updatedProfileData);

    setIsEditing(false);
    toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully."
    });
  }

  const totalVehicles = vehicles.length;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalServices = serviceRecords.length;
  const totalDocuments = documents.length;

  const upcomingRenewalsCount = insurancePolicies.filter(p => {
    if (isPast(new Date(p.expiryDate))) return false;
    const daysLeft = differenceInDays(new Date(p.expiryDate), new Date());
    return daysLeft <= 30;
  }).length;

  const nextServiceDueDays = serviceRecords
    .filter(s => s.nextDueDate && !isPast(new Date(s.nextDueDate)))
    .map(s => differenceInDays(new Date(s.nextDueDate!), new Date()))
    .sort((a, b) => a - b)[0];


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
    {
      icon: File,
      label: "Documents Stored",
      value: totalDocuments
    },
    {
      icon: AlertTriangle,
      label: "Upcoming Renewals",
      value: upcomingRenewalsCount
    },
    {
      icon: CalendarIcon,
      label: "Next Service Due",
      value: nextServiceDueDays !== undefined ? `${nextServiceDueDays} days` : "N/A"
    }
  ];

  if (isLoadingProfile || !profile || isDataLoading) {
      // Add a skeleton loader for the profile section
      return <div className="p-4 md:p-8">Loading Profile...</div>;
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="grid gap-8">
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row justify-between items-start">
             <div>
                <CardTitle className="font-headline text-2xl">User Profile</CardTitle>
                <CardDescription>Your personal information and app settings</CardDescription>
             </div>

             <div className="flex gap-2">
                {isEditing && (
                     <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                    </Button>
                )}
                <Button variant={isEditing ? "default" : "outline"} size="sm" className="gap-2" onClick={() => {
                    if (isEditing) {
                        form.handleSubmit(onProfileSubmit)();
                    } else {
                        setIsEditing(true);
                        form.reset({
                            ...profile,
                            dob: profile.dob ? new Date(profile.dob) : undefined,
                            licenseExpiryDate: profile.licenseExpiryDate ? new Date(profile.licenseExpiryDate) : undefined,
                            avatar: undefined,
                        }); 
                    }
                }}
                 disabled={isEditing && (!form.formState.isDirty || !form.formState.isValid)}
                >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    <span>{isEditing ? 'Save' : 'Edit'}</span>
                </Button>
             </div>

          </CardHeader>
          <CardContent>
            {isEditing ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                       <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field: { onChange, value, ...rest } }) => {
                                const newImagePreview = value?.[0] ? URL.createObjectURL(value[0]) : null;
                                return (
                                <FormItem>
                                    <FormLabel>Profile Picture</FormLabel>
                                    <FormControl>
                                        <div className="flex justify-center py-4">
                                            <div className="relative w-24 h-24">
                                                <Avatar className="h-24 w-24 text-3xl">
                                                    <AvatarImage src={newImagePreview || profile.avatarUrl || `https://avatar.vercel.sh/${user?.email}.png`} alt={profile.name || user?.email || ''} />
                                                    <AvatarFallback>{getInitials(profile.name || user?.email || '')}</AvatarFallback>
                                                </Avatar>
                                                <Input 
                                                    id="avatar-upload"
                                                    type="file" 
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={(e) => onChange(e.target.files)}
                                                    {...rest}
                                                />
                                                <label 
                                                    htmlFor="avatar-upload"
                                                    className="absolute -bottom-1 -right-1 flex items-center justify-center h-8 w-8 bg-primary rounded-full text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors border-2 border-card"
                                                >
                                                    <PenLine className="h-4 w-4" />
                                                </label>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )
                            }}
                        />
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
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="licenseNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Driving License Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="DL14 20110012345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="licenseExpiryDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>License Expiry</FormLabel>
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
                                                <span>Pick expiry date</span>
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
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                             />
                        </div>
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
                        <Separator />
                        <h3 className="text-base font-semibold">Emergency Contact</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="emergencyContactName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jane Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="emergencyContactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+91 98765 01234" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                    <IndianFlagIcon className="w-12 h-8" />
                </div>
                
                {/* Body */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <Avatar className="h-32 w-28 rounded-lg border-4 border-muted shadow-md">
                        <AvatarImage src={profile.avatarUrl || `https://avatar.vercel.sh/${user?.email}.png`} alt={profile.name || user?.email || ''} />
                        <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold rounded-lg">
                            {getInitials(profile.name || user?.email || '')}
                        </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="mb-2">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">NAME</p>
                        <p className="font-bold text-lg md:text-xl text-foreground -mt-1">{profile.name}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                      <div className="col-span-2 sm:col-span-3">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">ADDRESS</p>
                        <p className="font-medium text-foreground text-sm md:text-base">{profile.address || 'Not set'}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">DOB</p>
                        <p className="font-mono font-semibold text-foreground text-sm md:text-base">{profile.dob ? format(new Date(profile.dob), "dd-MM-yyyy") : 'Not set'}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">BLOOD</p>
                        <p className="font-mono font-semibold text-foreground text-sm md:text-base">{profile.bloodGroup || 'Not set'}</p>
                      </div>
                       <div className="col-span-1">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">VALID THRU</p>
                        <p className="font-mono font-semibold text-foreground text-sm md:text-base">{profile.licenseExpiryDate ? format(new Date(profile.licenseExpiryDate), "MM/yy") : 'N/A'}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">DL NO.</p>
                        <p className="font-mono font-semibold text-foreground text-sm md:text-base">{profile.licenseNumber || 'Not set'}</p>
                      </div>
                       <div className="col-span-2 sm:col-span-3">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide">EMERGENCY CONTACT</p>
                        <p className="font-medium text-foreground text-sm md:text-base">{profile.emergencyContactName && profile.emergencyContactPhone ? `${profile.emergencyContactName} (${profile.emergencyContactPhone})` : 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer / Signature */}
                <div className="flex justify-between items-end mt-2">
                    <div className="text-left">
                        <p className="font-mono text-xs text-muted-foreground">Class: ALL</p>
                        <p className="font-mono text-xs text-muted-foreground">Email: {user?.email}</p>
                    </div>
                    <div className="w-2/5">
                        <p className="font-serif text-lg md:text-2xl text-foreground/80 border-b border-muted-foreground pb-1 text-center italic">{profile.name}</p>
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
                                <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
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
