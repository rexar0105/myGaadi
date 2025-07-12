
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IndianRupee, LayoutDashboard, ShieldCheck, Sparkles, User, Wrench } from "lucide-react";

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
  { href: "/assessment", label: "AI Assess", icon: Sparkles, highlighted: true },
  { href: "/expenses", label: "Expenses", icon: IndianRupee },
  { href: "/insurance", label: "Insurance", icon: ShieldCheck },
];

function NavLink({ href, icon: Icon, label, highlighted = false }: { href: string; icon: React.ElementType; label: string, highlighted?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (highlighted) {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center justify-center rounded-full transition-all text-sm font-medium bg-accent text-accent-foreground shadow-lg hover:bg-accent/90",
          "h-14 w-14 -translate-y-2 md:h-16 md:w-16"
        )}
      >
        <Icon className="h-6 w-6 group-hover:animate-twinkle" />
        <span className="sr-only">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-all text-muted-foreground",
        isActive
          ? "text-primary"
          : "hover:text-primary"
      )}
    >
      <Icon className="h-5 w-5" />
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
                    <Link href="/profile">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || ''} />
                            <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                                {user ? getInitials(user.email) : <User />}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Profile</p>
                </TooltipContent>
            </Tooltip>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 bg-muted/40">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:border-none md:bg-transparent md:backdrop-blur-none md:relative">
        <div className="flex h-16 max-w-lg mx-auto items-center justify-around md:bg-background/95 md:backdrop-blur-sm md:rounded-full md:border md:bottom-4 md:fixed md:left-1/2 md:-translate-x-1/2 md:px-4 md:gap-2">
            {navItems.map(item => <NavLink key={item.href} {...item} />)}
        </div>
      </nav>
    </div>
    </TooltipProvider>
  );
}
