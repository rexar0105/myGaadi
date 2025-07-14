
"use client";

import React, { useRef, useEffect } from 'react';
import { FileText, PlusCircle, Car, Trash2, Upload } from "lucide-react";
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
import { useAppContext } from "@/context/app-provider";

const documentSchema = z.object({
  documentType: z.enum(["Registration", "Insurance", "Service", "Other"]),
  file: z
    .any()
    .refine((files) => files instanceof FileList && files?.length === 1, "A file is required."),
});

function AddDocumentForm({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const { toast } = useToast();
  const { addDocument } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    mode: "onChange",
    defaultValues: {
      documentType: "Registration",
      file: undefined
    },
  });

  const documentType = form.watch('documentType');
  const fileValue = form.watch('file');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        form.setValue('file', files, { shouldValidate: true });
    }
  };

  useEffect(() => {
    if (fileValue && fileValue.length > 0 && form.formState.isValid) {
        const values = form.getValues();
        onSubmit(values);
    }
  }, [fileValue, form.formState.isValid]);


  function onSubmit(values: z.infer<typeof documentSchema>) {
    const file = values.file[0];
    const fileName = file.name;

    const newDocumentData = {
        vehicleId,
        documentType: values.documentType,
        fileName,
        uploadDate: new Date().toISOString(),
        fileUrl: URL.createObjectURL(file)
    };
    
    addDocument(newDocumentData);

    toast({
      title: "Document Uploaded!",
      description: `${fileName} has been added.`,
    });
    form.reset();
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div className="bg-muted/50 p-4 rounded-lg mt-4 border">
        <h4 className="font-semibold text-sm mb-3">Add New Document</h4>
        <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
            <FormItem>
                <FormLabel className="text-xs">File</FormLabel>
                <FormControl>
                     <Button asChild variant="outline" className="w-full font-normal">
                        <label htmlFor={`file-upload-${vehicleId}`} className="w-full cursor-pointer flex items-center">
                            <Upload className="mr-2"/>
                            <span className="truncate max-w-[calc(100%-2rem)]">
                                {fileValue?.[0]?.name ?? 'Select a file...'}
                            </span>
                             <Input
                                id={`file-upload-${vehicleId}`}
                                type="file"
                                accept="image/*,.pdf"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="sr-only"
                                />
                        </label>
                    </Button>
                </FormControl>
                <FormMessage />
            </FormItem>
            </div>
        </form>
        </Form>
    </div>
  );
}

export function MyDocuments() {
  const { vehicles, documents, deleteDocument } = useAppContext();
  const { toast } = useToast();

  const handleDelete = (docId: string) => {
    deleteDocument(docId);
    toast({
      title: "Document Deleted",
      description: "The document has been removed.",
      variant: "destructive",
    });
  };

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
              const vehicleDocs = documents.filter(d => d.vehicleId === vehicle.id);
              return (
                <AccordionItem value={vehicle.id} key={vehicle.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 font-semibold">
                      <Car className="text-primary" />{" "}
                      {vehicle.name} ({vehicleDocs.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {vehicleDocs.length > 0 ? (
                         <ul className="space-y-3 pt-2">
                         {vehicleDocs.map((doc) => (
                           <li
                             key={doc.id}
                             className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                           >
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 overflow-hidden">
                               <FileText className="h-5 w-5 text-primary shrink-0" />
                               <div className="overflow-hidden">
                                 <p className="font-semibold truncate">{doc.fileName}</p>
                                 <p className="text-sm text-muted-foreground">
                                   {doc.documentType} - Uploaded on{" "}
                                   {format(
                                     new Date(doc.uploadDate),
                                     "dd MMM, yyyy"
                                   )}
                                 </p>
                               </div>
                             </a>
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => handleDelete(doc.id)}
                               className="ml-2"
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
