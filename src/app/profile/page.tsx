
"use client";

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
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const getInitials = (email: string) => {
    if (!email) return "?";
    return email[0].toUpperCase();
  };

  const handleLogout = () => {
    logout();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push("/login");
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground mb-1">
        Your Profile
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage your account settings and preferences.
      </p>
      <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="flex items-center gap-4">
             <Avatar className="h-16 w-16">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || ''} />
                <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
                    {user ? getInitials(user.email) : <User />}
                </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">{user?.email}</CardTitle>
              <CardDescription>Member since {new Date().getFullYear()}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <Separator />
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
             <Button variant="destructive" onClick={handleLogout} className="w-full md:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
           <p className="text-xs text-muted-foreground">More profile settings and information will be available here in the future.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
