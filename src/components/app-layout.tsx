
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IndianRupee, LayoutDashboard, LogOut, ShieldCheck, Sparkles, User, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AppLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="28" height="28" rx="8" fill="hsl(var(--primary))"/>
        <path d="M7 18C7 17.4477 7.44772 17 8 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H8C7.44772 19 7 18.5523 7 18Z" fill="hsl(var(--primary-foreground))" />
        <path d="M8 12C7.44772 12 7 12.4477 7 13V15C7 15.5523 7.44772 16 8 16H20C20.5523 16 21 15.5523 21 15V13C21 12.4477 20.5523 12 20 12H17L15 9H13L11 12H8Z" fill="hsl(var(--primary-foreground))" />
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
          "flex items-center justify-center rounded-full transition-all text-sm font-medium bg-orange-500 text-white shadow-lg hover:bg-orange-600",
          "h-14 w-14 -translate-y-2 md:h-16 md:w-16"
        )}
      >
        <Icon className="h-6 w-6" />
        <span className="sr-only">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-2 rounded-md transition-all text-muted-foreground",
        isActive
          ? "text-primary bg-primary/10"
          : "hover:text-primary hover:bg-primary/5"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium text-center">{label}</span>
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isAuthenticated && !['/login', '/signup'].includes(pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);


  const handleLogout = () => {
    logout();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push("/login");
  };

  if (!isAuthenticated && !['/login', '/signup'].includes(pathname)) {
    return null; 
  }

  if (!isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    return <>{children}</>;
  }


  return (
    <TooltipProvider>
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-3 font-semibold">
            <AppLogo />
            <span className="font-headline text-xl font-semibold">myGaadi</span>
        </Link>
        <div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/profile">
                            <User className="h-5 w-5" />
                            <span className="sr-only">Profile</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Profile</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Logout</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Logout</p>
                </TooltipContent>
            </Tooltip>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 bg-muted/40">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:border-none md:bg-transparent md:backdrop-blur-none md:relative">
        <div className="flex h-16 max-w-lg mx-auto items-center justify-around md:bg-background/95 md:backdrop-blur-sm md:rounded-full md:border md:bottom-4 md:fixed md:left-1/2 md:-translate-x-1/2 md:px-4 md:py-2 md:h-auto md:gap-4">
            {navItems.map(item => <NavLink key={item.href} {...item} />)}
        </div>
      </nav>
    </div>
    </TooltipProvider>
  );
}
