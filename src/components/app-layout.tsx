
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IndianRupee, LayoutDashboard, ShieldCheck, Sparkles, User, Wrench, Bell, FileText } from "lucide-react";
import { differenceInDays, isPast } from "date-fns";
import { serviceRecords, insurancePolicies } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
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
        <path d="M25 21C25 15.4772 20.5228 11 15 11C9.47715 11 5 15.4772 5 21" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" transform="translate(1, -1)"/>
        <circle cx="16" cy="20" r="2.5" fill="hsl(var(--primary-foreground))"/>
        <line x1="16" y1="20" x2="22" y2="14" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" transform="translate(0, -0.5)"/>
    </svg>
)

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/expenses", label: "Expenses", icon: IndianRupee },
  { href: "/insurance", label: "Insurance", icon: ShieldCheck },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/assessment", label: "AI Assess", icon: Sparkles },
];

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (href === '/assessment') {
    return (
        <div className="flex items-center justify-center">
            <Link
                href={href}
                className={cn(
                "group flex items-center justify-center rounded-full transition-all text-sm font-medium bg-primary text-primary-foreground shadow-lg hover:bg-primary/90",
                "h-14 w-14"
                )}
            >
                <Icon className="h-7 w-7 group-hover:animate-twinkle" />
                <span className="sr-only">{label}</span>
            </Link>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg transition-colors text-muted-foreground hover:bg-accent/50 h-16",
        isActive
          ? "text-primary bg-accent/80"
          : "hover:text-primary"
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs font-medium text-center">{label}</span>
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
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

  const urgentAlertsCount = [
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
  
  const navGrid = {
    gridTemplateColumns: `repeat(${navItems.length}, 1fr)`
  }

  return (
    <TooltipProvider>
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <AppLogo />
            <span className="font-headline text-xl font-semibold">myGaadi</span>
        </Link>
        <div className="flex items-center gap-2">
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:border-none md:bg-transparent md:backdrop-blur-none md:relative">
        <div className="grid h-20 max-w-lg mx-auto items-center justify-around md:bg-background/95 md:backdrop-blur-sm md:rounded-full md:border md:bottom-4 md:fixed md:left-1/2 md:-translate-x-1/2 md:px-2 md:gap-2" style={navGrid}>
            {navItems.map(item => {
              if (item.href === '/assessment') {
                const assessItem = navItems.splice(navItems.findIndex(i => i.href === '/assessment'), 1)[0];
                const middleIndex = Math.floor(navItems.length / 2);
                navItems.splice(middleIndex, 0, assessItem);
              }
              return null;
            })}
            {navItems.map(item => <NavLink key={item.href} {...item} />)}
        </div>
      </nav>
    </div>
    </TooltipProvider>
  );
}
