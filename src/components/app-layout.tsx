
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IndianRupee, LayoutDashboard, ShieldCheck, Sparkles, User, Wrench, Bell, History } from "lucide-react";
import { differenceInDays, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
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
        <path d="M24 20C24 14.4772 19.5228 10 14 10C8.47715 10 4 14.4772 4 20" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="14" cy="20" r="2.5" fill="hsl(var(--primary-foreground))"/>
        <line x1="14" y1="20" x2="21" y2="13" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
)

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/assessment", label: "AI Assess", icon: Sparkles },
  { href: "/expenses", label: "Expenses", icon: IndianRupee },
  { href: "/insurance", label: "Insurance", icon: ShieldCheck },
];

function NavLink({ href, icon: Icon, label, isActive }: { href: string; icon: React.ElementType; label: string, isActive: boolean }) {
  if (href === '/assessment') {
    return (
      <div className="group">
        <Link
            href={href}
            className="relative -top-6 flex flex-col items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform"
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
        "flex flex-col items-center justify-center gap-1 p-2 transition-colors text-muted-foreground w-16 h-16 hover:text-primary",
      )}
    >
      <div className={cn(
          "flex items-center justify-center h-8 w-12 rounded-full transition-colors",
          isActive ? "bg-primary/10" : "bg-transparent"
      )}>
        <Icon className={cn("h-6 w-6", isActive && "text-primary")} />
      </div>
      <span className={cn(
          "text-xs font-medium",
           isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { serviceRecords, insurancePolicies, isLoading } = useData();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isAuthenticated && !['/login', '/signup'].includes(pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && !['/login', '/signup'].includes(pathname)) {
    return null; 
  }

  if (!isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    return <>{children}</>;
  }

  const getInitials = (email: string) => {
    if (!email) return "?";
    return email[0].toUpperCase();
  };

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
                                <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || ''} />
                                <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                                    {user ? getInitials(user.email) : <User />}
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
