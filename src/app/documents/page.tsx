
"use client";

import { useState } from "react";
import { FileText, PlusCircle, Upload, Car, Trash2 } from "lucide-react";
import { documents as initialDocuments, vehicles } from "@/lib/data";
import type { Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

const documentSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  documentType: z.enum(["Registration", "Insurance", "Service", "Other"]),
  fileName: z.string().min(1, "File name is required"),
});

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      vehicleId: "",
      documentType: "Registration",
      fileName: "",
    },
  });

  function onSubmit(values: z.infer<typeof documentSchema>) {
    const vehicleName =
      vehicles.find((v) => v.id === values.vehicleId)?.name ||
      "Unknown Vehicle";
    const newDocument: Document = {
      id: `d${documents.length + 1}`,
      ...values,
      vehicleName,
      uploadDate: new Date().toISOString(),
      fileUrl: "#", // In a real app, this would be a URL to the uploaded file
    };
    setDocuments((prev) =>
      [newDocument, ...prev].sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      )
    );
    toast({
      title: "Document Uploaded!",
      description: `${values.fileName} has been added.`,
    });
    setDialogOpen(false);
    form.reset();
  }

  const handleDelete = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast({
        title: "Document Deleted",
        description: "The document has been removed.",
        variant: "destructive"
    })
  }

  const documentsByVehicle = documents.reduce((acc, doc) => {
    (acc[doc.vehicleId] = acc[doc.vehicleId] || []).push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Document Locker
          </h1>
          <p className="text-muted-foreground">
            Store and manage all your vehicle-related documents.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Document</DialogTitle>
              <DialogDescription>
                Select a vehicle and upload your document. This is a simulation; no file will be stored.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Registration">Registration</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                          <SelectItem value="Service">Service Record</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fileName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Name</FormLabel>
                       <FormControl>
                        <div className="relative">
                            <Input placeholder="Registration_Cert.pdf" {...field} />
                             <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
                                <Upload className="h-4 w-4 text-muted-foreground"/>
                             </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Upload Document
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-8">
        {Object.keys(documentsByVehicle).length > 0 ? Object.entries(documentsByVehicle).map(([vehicleId, docs], index) => {
            const vehicle = vehicles.find(v => v.id === vehicleId);
            return (
                <Card key={vehicleId} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-xl">
                            <Car className="text-primary"/> {vehicle?.name || "Unknown Vehicle"}
                        </CardTitle>
                        <CardDescription>
                            {docs.length} document{docs.length > 1 ? 's' : ''} stored.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {docs.map(doc => (
                                <li key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-primary"/>
                                        <div>
                                            <p className="font-semibold">{doc.fileName}</p>
                                            <p className="text-sm text-muted-foreground">{doc.documentType} - Uploaded on {format(new Date(doc.uploadDate), "dd MMM, yyyy")}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )
        }) : (
             <div className="col-span-full text-center text-muted-foreground py-20 flex flex-col items-center gap-4">
                  <FileText className="h-16 w-16 text-muted-foreground/30"/>
                  <p className="font-medium text-lg">Your document locker is empty.</p>
                  <p className="text-sm">Click "Add Document" to upload your first file.</p>
              </div>
        )}
      </div>
    </div>
  );
}
