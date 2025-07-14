
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IndianRupee, LayoutDashboard, ShieldCheck, Sparkles, User, Wrench, Bell, History, Loader2, MessageSquare } from "lucide-react";
import { differenceInDays, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/app-provider";
import { Button } from "./ui/button";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

const AppLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"/>
        <circle cx="16" cy="16" r="10" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.8" strokeWidth="2"/>
        <path d="M16 16L22 13" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="2" fill="hsl(var(--primary-foreground))"/>
    </svg>
)

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/assessment", label: "AI Assess", icon: Sparkles, isCentral: true },
  { href: "/expenses", label: "Expenses", icon: IndianRupee },
  { href: "/insurance", label: "Insurance", icon: ShieldCheck },
];

function NavLink({ href, icon: Icon, label, isActive, isCentral }: { href: string; icon: React.ElementType; label: string, isActive: boolean, isCentral?: boolean }) {
  const LinkComponent = isCentral ? 'div' : Link;

  if (isCentral) {
    return (
      <div className="group relative">
        <Link
          href={href}
          className="relative -top-8 flex flex-col items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform"
        >
          <Icon className="h-8 w-8 group-hover:animate-twinkle" />
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 transition-colors text-muted-foreground w-16 h-16 relative rounded-lg",
        isActive && "text-primary"
      )}
    >
      <div className={cn(
          "flex items-center justify-center h-8 w-12 rounded-full transition-colors relative",
          isActive ? "bg-primary/10" : "bg-transparent group-hover:bg-accent/50"
      )}>
        <Icon className={cn("h-6 w-6")} />
      </div>
      <span className={cn(
          "text-xs font-medium"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, profile, serviceRecords, insurancePolicies } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && !['/login', '/signup'].includes(pathname)) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);


  const getInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return "?";
    
    const parts = nameOrEmail.split(' ').filter(Boolean);
    if(parts.length > 1 && parts[0] && parts[1]) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameOrEmail[0].toUpperCase();
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (!isAuthenticated) {
    if (['/login', '/signup'].includes(pathname)) {
        return <>{children}</>;
    }
    return null;
  }

  const urgentAlertsCount = isLoading ? 0 : [
    ...serviceRecords.filter((s) => {
        if (!s.nextDueDate || isPast(new Date(s.nextDueDate))) return false;
        const daysLeft = differenceInDays(new Date(s.nextDueDate), new Date());
        return daysLeft <= 14;
    }),
    ...insurancePolicies.filter((p) => {
        if (isPast(new Date(p.expiryDate))) return false;
        const daysLeft = differenceInDays(new Date(p.expiryDate), new Date());
        return daysLeft <= 30;
    })
  ].length;

  return (
    <TooltipProvider>
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <AppLogo />
            <span className="font-headline text-xl font-semibold">myGaadi</span>
        </Link>
        <div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/activity">
                            <History />
                            <span className="sr-only">Recent Activity</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Recent Activity</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon" className="relative">
                        <Link href="/alerts">
                            <Bell />
                             {urgentAlertsCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{urgentAlertsCount}</Badge>
                            )}
                            <span className="sr-only">Alerts</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Notifications</p>
                </TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/profile">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatarUrl ?? `https://avatar.vercel.sh/${user?.email}.png`} alt={profile?.name || user?.email || ''} />
                                <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                                    {user ? getInitials(profile?.name || user.email || '') : <User />}
                                </AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Profile</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Profile</p>
                </TooltipContent>
            </Tooltip>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 bg-muted/40">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50">
        <div className="flex h-full items-center justify-around max-w-lg mx-auto px-2">
            {navItems.map((item) => (
                <NavLink key={item.href} {...item} isActive={pathname === item.href} />
            ))}
        </div>
      </nav>
    </div>
    </TooltipProvider>
  );
}
