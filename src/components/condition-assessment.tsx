
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  assessVehicleCondition,
  AssessVehicleConditionOutput,
} from "@/ai/flows/assess-vehicle-condition";
import {
    generateVehicleImage,
    GenerateVehicleImageOutput,
} from "@/ai/flows/generate-vehicle-image-flow";
import { Check, Info, Loader2, Sparkles, Upload, Wand2, X, ImageIcon } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function ConditionAssessment() {
  const { toast } = useToast();
  const [isAssessing, startAssessmentTransition] = useTransition();
  const [isGenerating, startGenerationTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessVehicleConditionOutput | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GenerateVehicleImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAssessmentResult(null);
      setGeneratedImage(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const getVehicleDescription = (fileName: string) => {
    // Simple heuristic to get a generic description, you could make this more robust
    const name = fileName.toLowerCase().replace(/[^a-z\s]/gi, '');
    if (name.includes('car')) return 'car';
    if (name.includes('suv')) return 'suv';
    if (name.includes('motorcycle') || name.includes('bike')) return 'motorcycle';
    return 'vehicle';
  }


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setError(null);
    setAssessmentResult(null);
    setGeneratedImage(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        const base64data = reader.result as string;
        
        startAssessmentTransition(async () => {
            try {
            const assessment = await assessVehicleCondition({
                photoDataUri: base64data,
            });
            setAssessmentResult(assessment);

            // Kick off image generation after assessment is done
            startGenerationTransition(async () => {
                try {
                    const imageResult = await generateVehicleImage({
                        assessment: assessment.assessment,
                        vehicleDescription: getVehicleDescription(file.name),
                    });
                    setGeneratedImage(imageResult);
                } catch (e) {
                    console.error("Image generation failed:", e);
                     toast({
                        variant: "destructive",
                        title: "Image Generation Failed",
                        description: "Could not generate the creative image.",
                    });
                }
            });

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
        });
    };
  };

  const isPending = isAssessing || isGenerating;

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid lg:grid-cols-2 gap-8 items-start pt-6">
          
          <div className="flex flex-col gap-4">
             <div className="aspect-video w-full">
                <Label
                htmlFor="photo-upload"
                className="w-full h-full border-2 border-dashed rounded-xl flex flex-col justify-center items-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20"
                >
                {previewUrl ? (
                    <Image
                    src={previewUrl}
                    alt="Vehicle preview"
                    width={400}
                    height={225}
                    className="object-cover h-full w-full rounded-lg"
                    />
                ) : (
                    <>
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="mt-2 font-medium text-foreground">
                        Click to upload a photo
                    </span>
                    <span className="text-sm text-muted-foreground/80">PNG, JPG, or WEBP</span>
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
            </div>
            <Button type="submit" disabled={isPending || !file} size="lg" className="w-full">
              {isAssessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assessing...
                </>
              ) : (
                <>
                 <Wand2 className="mr-2"/>
                 Assess Condition
                </>
              )}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="min-h-[300px] bg-muted/40 p-4 rounded-xl relative overflow-y-auto">
                {isAssessing && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Analyzing image...</p>
                        <p className="text-xs">This may take a moment.</p>
                    </div>
                )}
                {error && (
                <Alert variant="destructive">
                    <X className="h-4 w-4"/>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                )}
                {assessmentResult && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-foreground flex items-center gap-2"><Check className="text-green-500"/> AI Assessment</h4>
                            <p className="text-sm text-muted-foreground">{assessmentResult.assessment}</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-foreground flex items-center gap-2"><Info className="text-amber-500"/> Risk Assessment</h4>
                            <p className="text-sm text-muted-foreground">{assessmentResult.riskAssessment}</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="text-blue-500"/> Maintenance Tips</h4>
                            <p className="text-sm text-muted-foreground">{assessmentResult.maintenanceTips}</p>
                        </div>
                    </div>
                )}
                {!isAssessing && !assessmentResult && !error && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <Wand2 className="h-10 w-10 text-muted-foreground/50" />
                        <p className="font-medium">Your assessment will appear here</p>
                        <p className="text-sm text-center">Upload a vehicle photo to begin.</p>
                    </div>
                )}
            </div>

            <div className="min-h-[300px] bg-muted/40 rounded-xl relative overflow-hidden flex items-center justify-center p-2 aspect-square">
                 {isGenerating && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Generating image...</p>
                        <p className="text-xs text-center">AI is creating a masterpiece.</p>
                    </div>
                )}
                {generatedImage && (
                    <div className="animate-fade-in w-full h-full">
                         <Image
                            src={generatedImage.imageUrl}
                            alt="AI generated vehicle image"
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>
                )}
                {!isGenerating && !generatedImage && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground text-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                        <p className="font-medium">AI-Generated Image</p>
                        <p className="text-sm">A creative image based on your vehicle's assessment will appear here.</p>
                    </div>
                )}
            </div>
          </div>
        </CardContent>
         <div className="px-6 pb-6">
            <p className="text-xs text-muted-foreground">
                Disclaimer: The AI assessment and generated images are for informational and entertainment purposes only and are not a substitute for professional mechanical advice.
            </p>
        </div>
      </form>
    </Card>
  );
}
