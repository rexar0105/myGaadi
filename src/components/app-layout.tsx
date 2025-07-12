"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, IndianRupee, LayoutDashboard, ShieldCheck, Sparkles, Wrench, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "AI Assessment", icon: Sparkles },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/expenses", label: "Expenses", icon: IndianRupee },
  { href: "/insurance", label: "Insurance", icon: ShieldCheck },
];

function NavLink({ href, icon: Icon, label, isMobile = false }: { href: string; icon: React.ElementType; label: string; isMobile?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="bg-primary text-primary-foreground p-2 rounded-full">
                <Car className="h-6 w-6" />
              </div>
              <span className="font-headline text-xl">myGaadi</span>
            </Link>
          </div>
          <nav className="flex-1 grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(item => <NavLink key={item.href} {...item} />)}
          </nav>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <div className="bg-primary text-primary-foreground p-2 rounded-full">
                    <Car className="h-6 w-6" />
                  </div>
                  <span className="font-headline text-xl">myGaadi</span>
                </Link>
                {navItems.map(item => <NavLink key={item.href} {...item} isMobile />)}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search or other header items here */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 bg-muted/40">
            {children}
        </main>
      </div>
    </div>
  );
}
