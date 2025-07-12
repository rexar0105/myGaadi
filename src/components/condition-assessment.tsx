"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  assessVehicleCondition,
  AssessVehicleConditionOutput,
} from "@/ai/flows/assess-vehicle-condition";
import { Loader2, Sparkles, Upload } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function ConditionAssessment() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AssessVehicleConditionOutput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setError(null);
    setResult(null);

    startTransition(async () => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const assessment = await assessVehicleCondition({
            photoDataUri: base64data,
          });
          setResult(assessment);
        } catch (e) {
          console.error(e);
          const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Assessment Failed",
            description: "Could not assess the vehicle's condition. Please try again.",
          });
        }
      };
    });
  };

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                <Sparkles className="h-6 w-6"/>
            </div>
            <div>
                <CardTitle className="font-headline text-xl">AI Condition Assessment</CardTitle>
                <CardDescription>
                Upload a photo for an AI-driven analysis.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4 items-center">
            <Label
              htmlFor="photo-upload"
              className="w-full h-48 border-2 border-dashed rounded-xl flex flex-col justify-center items-center cursor-pointer hover:bg-primary/5 transition-colors"
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Vehicle preview"
                  width={200}
                  height={192}
                  className="object-contain h-full w-full p-2 rounded-lg"
                />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="mt-2 text-sm text-muted-foreground">
                    Click to upload a photo
                  </span>
                  <span className="text-xs text-muted-foreground/80">PNG, JPG, WEBP</span>
                </>
              )}
            </Label>
            <input
              id="photo-upload"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !file} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assessing...
                </>
              ) : (
                "Assess Condition"
              )}
            </Button>
          </div>

          <div className="min-h-[250px] bg-secondary/50 p-4 rounded-xl">
            {isPending && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Analyzing image...</p>
                    <p className="text-xs">This may take a moment.</p>
                </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <Accordion type="single" collapsible defaultValue="item-1" className="w-full animate-fade-in">
                <AccordionItem value="item-1">
                  <AccordionTrigger>AI Assessment</AccordionTrigger>
                  <AccordionContent>{result.assessment}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Risk Assessment</AccordionTrigger>
                  <AccordionContent>{result.riskAssessment}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Maintenance Tips</AccordionTrigger>
                  <AccordionContent>{result.maintenanceTips}</AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            {!isPending && !result && !error && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <Sparkles className="h-8 w-8" />
                    <p>Your assessment will appear here.</p>
                </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Disclaimer: The AI assessment is for informational purposes only and is not a substitute for professional mechanical advice.
            </p>
        </CardFooter>
      </form>
    </Card>
  );
}
