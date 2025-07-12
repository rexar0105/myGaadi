import Image from "next/image";
import { Car } from "lucide-react";
import { vehicles } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <main className="p-4 md:p-8 flex-1">
      <h2 className="text-3xl font-bold font-headline text-foreground mb-8">
        Your Vehicles
      </h2>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Car className="text-primary" /> Registered Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="rounded-2xl border p-4 flex flex-col gap-4 bg-card hover:bg-muted/50 transition-colors">
              <Image
                src={vehicle.imageUrl}
                alt={vehicle.name}
                width={400}
                height={200}
                className="rounded-lg object-cover aspect-video"
                data-ai-hint={vehicle.dataAiHint}
              />
              <div>
                <h3 className="font-bold text-xl font-headline">{vehicle.name}</h3>
                <p className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                <p className="text-sm font-mono mt-2 bg-secondary/70 text-secondary-foreground inline-block px-2 py-1 rounded-md">{vehicle.registrationNumber}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
