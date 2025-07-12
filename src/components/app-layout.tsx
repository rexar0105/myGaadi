"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, IndianRupee, LayoutDashboard, ShieldCheck, Sparkles, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "AI Assess", icon: Sparkles },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/expenses", label: "Expenses", icon: IndianRupee },
  { href: "/insurance", label: "Insurance", icon: ShieldCheck },
];

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

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
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
            <Car className="h-6 w-6" />
            </div>
            <span className="font-headline text-xl">myGaadi</span>
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 bg-muted/40">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:border-none md:bg-transparent md:backdrop-blur-none md:relative">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto md:bg-background/95 md:backdrop-blur-sm md:rounded-full md:border md:bottom-4 md:fixed md:left-1/2 md:-translate-x-1/2 md:p-1 md:h-auto">
            {navItems.map(item => <NavLink key={item.href} {...item} />)}
        </div>
      </nav>
    </div>
  );
}
