import { Car, UserCircle } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-full">
            <Car className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-headline text-foreground tracking-tight">
            myGaadi
          </h1>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}
