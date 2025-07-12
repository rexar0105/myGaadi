
"use client";

import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const getInitials = (email: string) => {
    if (!email) return "?";
    return email[0].toUpperCase();
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <h2 className="text-3xl font-bold font-headline text-foreground mb-8">
        Your Profile
      </h2>
      <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="flex items-center gap-4">
             <Avatar className="h-16 w-16">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email} />
                <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
                    {user ? getInitials(user.email) : <User />}
                </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">{user?.email}</CardTitle>
              <CardDescription>Manage your account settings.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground text-sm">More profile settings and information will be available here in the future.</p>
        </CardContent>
      </Card>
    </div>
  );
}
