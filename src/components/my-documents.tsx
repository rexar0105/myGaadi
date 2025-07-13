
"use client";

import { useState } from "react";
import { FileText, PlusCircle, Car, Trash2 } from "lucide-react";
import type { Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useData } from "@/context/data-context";

const documentSchema = z.object({
  documentType: z.enum(["Registration", "Insurance", "Service", "Other"]),
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "A file is required."),
});

function AddDocumentForm({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const { toast } = useToast();
  const { addDocument } = useData();

  const form = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    mode: "onChange",
    defaultValues: {
      documentType: "Registration",
    },
  });

  const fileRef = form.register("file");

  function onSubmit(values: z.infer<typeof documentSchema>) {
    const fileName = values.file[0].name;

    const newDocumentData = {
        vehicleId,
        documentType: values.documentType,
        fileName,
        uploadDate: new Date().toISOString(),
        fileUrl: URL.createObjectURL(values.file[0])
    };
    
    addDocument(newDocumentData);

    toast({
      title: "Document Uploaded!",
      description: `${fileName} has been added.`,
    });
    form.reset();
  }

  return (
    <div className="bg-muted/50 p-4 rounded-lg mt-4 border">
        <h4 className="font-semibold text-sm mb-3">Add New Document</h4>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 items-end">
            <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs">Document Type</FormLabel>
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
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel className="text-xs">File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      {...fileRef}
                      className="file:text-primary file:font-semibold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            <Button type="submit" size="sm" className="w-full sm:w-auto" disabled={!form.formState.isValid}>
            <PlusCircle />
            Upload Document
            </Button>
        </form>
        </Form>
    </div>
  );
}

export function MyDocuments() {
  const { vehicles, documents, deleteDocument } = useData();
  const { toast } = useToast();

  const handleDelete = (docId: string) => {
    deleteDocument(docId);
    toast({
      title: "Document Deleted",
      description: "The document has been removed.",
      variant: "destructive",
    });
  };

  const documentsByVehicle = documents.reduce((acc, doc) => {
    (acc[doc.vehicleName] = acc[doc.vehicleName] || []).push(doc);
    return acc;
  }, {} as Record<string, Document[]>);


  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
      <CardHeader>
        <div>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <FileText /> My Documents
          </CardTitle>
          <CardDescription>
            Store and manage your vehicle-related documents.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {vehicles.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {vehicles.map((vehicle) => {
              const docs = documents.filter(d => d.vehicleId === vehicle.id) || [];
              return (
                <AccordionItem value={vehicle.id} key={vehicle.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 font-semibold">
                      <Car className="text-primary" />{" "}
                      {vehicle.name} ({docs.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {docs.length > 0 ? (
                         <ul className="space-y-3 pt-2">
                         {docs.map((doc) => (
                           <li
                             key={doc.id}
                             className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                           >
                             <div className="flex items-center gap-3">
                               <FileText className="h-5 w-5 text-primary" />
                               <div>
                                 <p className="font-semibold">{doc.fileName}</p>
                                 <p className="text-sm text-muted-foreground">
                                   {doc.documentType} - Uploaded on{" "}
                                   {format(
                                     new Date(doc.uploadDate),
                                     "dd MMM, yyyy"
                                   )}
                                 </p>
                               </div>
                             </div>
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => handleDelete(doc.id)}
                             >
                               <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                           </li>
                         ))}
                       </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No documents for this vehicle yet.</p>
                    )}
                    <AddDocumentForm vehicleId={vehicle.id} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
            <FileText className="h-16 w-16 text-muted-foreground/30" />
            <p className="font-medium text-lg">
              No vehicles found.
            </p>
            <p className="text-sm">
              Add a vehicle from the dashboard to start uploading documents.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
